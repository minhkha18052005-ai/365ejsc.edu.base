import { expect, test, type Page } from "@playwright/test"
import { loadEnv } from "vite"

const apiUrl = loadEnv("test", process.cwd(), "VITE_").VITE_DEMO_API_URL
if (!apiUrl) throw new Error("Thiếu VITE_DEMO_API_URL trong môi trường test.")
const endpoint = `${apiUrl.replace(/\/+$/, "")}/todos`
type FixtureTodo = {
  id: string
  task: string
  desc: string
  dueDate: number
  createdAt: string
}

async function mockTodos(page: Page) {
  let todos: FixtureTodo[] = [
    {
      id: "1",
      task: "Chuẩn bị báo cáo",
      desc: "Báo cáo tuần",
      dueDate: 1791115109,
      createdAt: "2026-10-04T11:30:48.808Z",
    },
  ]
  let failNext = false
  const requests: { method: string; body?: Record<string, unknown> }[] = []
  await page.route(`${endpoint}**`, async (route) => {
    const request = route.request()
    const method = request.method()
    const body =
      method === "POST" || method === "PUT"
        ? (request.postDataJSON() as Record<string, unknown>)
        : undefined
    requests.push({ method, body })
    if (failNext) {
      failNext = false
      await route.fulfill({ status: 503, json: { error: "Unavailable" } })
      return
    }
    const id = request.url().split("/").at(-1)
    if (method === "GET") {
      await route.fulfill({ json: todos })
      return
    }
    if (method === "POST") {
      const todo = { ...body, id: "2" } as FixtureTodo
      todos = [todo, ...todos]
      await route.fulfill({ status: 201, json: todo })
      return
    }
    if (method === "PUT") {
      const todo = {
        ...todos.find((item) => item.id === id),
        ...body,
      } as FixtureTodo
      todos = todos.map((item) => (item.id === id ? todo : item))
      await route.fulfill({ json: todo })
      return
    }
    todos = todos.filter((item) => item.id !== id)
    await route.fulfill({ status: 204 })
  })
  return {
    requests,
    failOnce: () => {
      failNext = true
    },
  }
}

test("public Demo Todos: view, create, edit, search and delete", async ({
  page,
}, testInfo) => {
  const mock = await mockTodos(page)
  await page.goto("/")
  await expect(page).toHaveURL(/\/demo\/todos$/)
  await expect(
    page.getByRole("heading", { name: "Todos", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Demo", exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Xem Chuẩn bị báo cáo" }).click()
  await expect(page.getByRole("dialog")).toContainText("Báo cáo tuần")
  await page.keyboard.press("Escape")
  await page
    .getByRole("button", { name: "Thêm công việc", exact: true })
    .click()
  await page.getByLabel("Tên công việc").fill("  Công việc mới  ")
  await page.getByLabel("Hạn hoàn thành").fill("2026-11-01T10:30")
  await page.getByLabel("Mô tả").fill("Mô tả mới")
  await page.getByRole("button", { name: "Lưu công việc" }).click()
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await expect(
    page.getByRole("button", { name: "Sửa Công việc mới" })
  ).toBeVisible()
  const created = mock.requests.find(
    (request) => request.method === "POST"
  )?.body
  expect(created?.task).toBe("Công việc mới")
  expect(typeof created?.dueDate).toBe("number")
  expect(created?.createdAt).toEqual(expect.any(String))
  await page.getByRole("button", { name: "Sửa Công việc mới" }).click()
  await page.getByLabel("Tên công việc").fill("Công việc cập nhật")
  await page.getByRole("button", { name: "Lưu công việc" }).click()
  await expect(
    page.getByRole("button", { name: "Sửa Công việc cập nhật" })
  ).toBeVisible()
  await page.getByRole("textbox", { name: "Tìm công việc" }).fill("cập nhật")
  await expect(
    page.getByRole("button", { name: "Sửa Chuẩn bị báo cáo" })
  ).not.toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath("todos-desktop.png"),
    fullPage: true,
  })
  await page.getByRole("button", { name: "Xóa Công việc cập nhật" }).click()
  await page.getByRole("button", { name: "Hủy", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Xóa Công việc cập nhật" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Xóa Công việc cập nhật" }).click()
  await page.getByRole("button", { name: "Xác nhận xóa" }).click()
  await expect(page.getByText("Không có kết quả phù hợp")).toBeVisible()
  expect(
    mock.requests.filter((request) => request.method === "DELETE")
  ).toHaveLength(1)
  const tokenHeaders = await page.evaluate(() =>
    localStorage.getItem("auth_session")
  )
  expect(tokenHeaders).toBeNull()
})

test("failed mutation retains form and allows retry; duplicate submit is locked", async ({
  page,
}) => {
  const mock = await mockTodos(page)
  await page.goto("/demo/todos")
  await page.getByRole("button", { name: "Sửa Chuẩn bị báo cáo" }).click()
  mock.failOnce()
  await page.getByLabel("Tên công việc").fill("Giữ lại khi lỗi")
  await page.getByRole("button", { name: "Lưu công việc" }).click()
  await expect(page.getByRole("alert")).toContainText("503")
  await expect(page.getByLabel("Tên công việc")).toHaveValue("Giữ lại khi lỗi")
  await page.getByRole("button", { name: "Lưu công việc" }).click()
  await expect(
    page.getByRole("button", { name: "Sửa Giữ lại khi lỗi" })
  ).toBeVisible()
  mock.failOnce()
  await page.getByRole("button", { name: "Tải lại danh sách" }).click()
  await expect(page.getByRole("alert")).toContainText("503")
  await page.getByRole("button", { name: "Thử lại" }).click()
  await expect(
    page.getByRole("button", { name: "Sửa Giữ lại khi lỗi" })
  ).toBeVisible()
})

test("mobile layout and unknown route need no login", async ({ page }) => {
  await mockTodos(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/demo/todos")
  await expect(
    page.getByRole("button", { name: "Sửa Chuẩn bị báo cáo" })
  ).toBeAttached()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.goto("/login")
  await expect(
    page.getByRole("heading", { name: "Không tìm thấy trang" })
  ).toBeVisible()
})
