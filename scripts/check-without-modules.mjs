import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { spawn, spawnSync } from "node:child_process"
import { chromium } from "@playwright/test"

// Test an isolated copy, so the running project and user data stay intact.
const root = process.cwd()
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v2-module-check-"))
let browser
let server
try {
  fs.cpSync(path.join(root, "src"), path.join(tempRoot, "src"), {
    recursive: true,
    filter: (source) =>
      path.relative(path.join(root, "src"), source).split(path.sep)[0] !==
      "modules",
  })
  fs.mkdirSync(path.join(tempRoot, "src", "modules"))
  for (const file of [
    "index.html",
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
  ]) {
    fs.copyFileSync(path.join(root, file), path.join(tempRoot, file))
  }
  if (fs.existsSync(path.join(root, "public")))
    fs.cpSync(path.join(root, "public"), path.join(tempRoot, "public"), {
      recursive: true,
    })
  fs.symlinkSync(
    path.join(root, "node_modules"),
    path.join(tempRoot, "node_modules"),
    process.platform === "win32" ? "junction" : "dir"
  )
  for (const file of ["tsconfig.app.json", "tsconfig.node.json"]) {
    const target = path.join(tempRoot, file)
    fs.writeFileSync(
      target,
      fs
        .readFileSync(target, "utf8")
        .replaceAll("./node_modules/.tmp/", "./.cache/")
    )
  }
  const result = spawnSync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["build"],
    {
      cwd: tempRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
      windowsHide: true,
    }
  )
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error("Build failed without modules.")
  const port = 5185
  const url = `http://127.0.0.1:${port}`
  server = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/vite/bin/vite.js"),
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: tempRoot,
      stdio: "pipe",
      windowsHide: true,
    }
  )
  let serverError = ""
  server.stderr.on("data", (chunk) => {
    serverError += chunk
  })
  server.on("error", (error) => {
    serverError += error.message
  })
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null)
      throw new Error(serverError || "Preview server exited.")
    try {
      if ((await fetch(url)).ok) break
    } catch {
      /* Wait for preview startup. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  browser = await chromium.launch({ channel: "chrome", headless: true })
  const page = await browser.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(url)
  await page
    .getByRole("heading", { name: "Chưa có module", exact: true })
    .waitFor()
  if ((await page.locator("nav a").count()) !== 0)
    throw new Error("Stale module links remain.")
  await page.keyboard.press("Control+k")
  await page.getByRole("dialog").waitFor()
  if ((await page.getByRole("option").count()) !== 0)
    throw new Error("Stale search results remain.")
  await page.keyboard.press("Escape")
  await page.goto(`${url}/users`)
  await page
    .getByRole("heading", { name: "Không tìm thấy trang", exact: true })
    .waitFor()
  if (errors.length) throw new Error(errors.join("\n"))
  console.log(
    "Passed: build, empty shell, old route fallback, search work without any modules."
  )
} finally {
  if (browser) await browser.close()
  if (server) {
    server.kill()
    if (server.exitCode === null)
      await new Promise((resolve) => server.once("exit", resolve))
  }
  const resolved = path.resolve(tempRoot)
  if (
    path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
    !path.basename(resolved).startsWith("v2-module-check-")
  )
    throw new Error("Unexpected cleanup path.")
  // Unlink the dependency junction first; cleanup cannot traverse project dependencies.
  const dependencies = path.join(resolved, "node_modules")
  if (fs.existsSync(dependencies)) fs.unlinkSync(dependencies)
  fs.rmSync(resolved, { recursive: true, force: true })
}
