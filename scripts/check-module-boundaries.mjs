import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = path.resolve("src")
const modulesRoot = path.join(root, "modules")
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : [path.join(dir, entry.name)]
    )
}
const violations = []
for (const file of files(root).filter((file) => /\.tsx?$/.test(file))) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true
  )
  function check(specifier) {
    if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return
    const target = specifier.startsWith("@/")
      ? path.join(root, specifier.slice(2))
      : path.resolve(path.dirname(file), specifier)
    if (!target.startsWith(`${modulesRoot}${path.sep}`)) return
    const targetModule = path.relative(modulesRoot, target).split(path.sep)[0]
    const sourceModule = file.startsWith(`${modulesRoot}${path.sep}`)
      ? path.relative(modulesRoot, file).split(path.sep)[0]
      : null
    if (sourceModule !== targetModule)
      violations.push(`${path.relative(root, file)} imports ${specifier}`)
  }
  function scan(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      check(node.moduleSpecifier.text)
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(source) === "require") &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      check(node.arguments[0].text)
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      check(node.argument.literal.text)
    ts.forEachChild(node, scan)
  }
  scan(source)
}
if (violations.length) {
  console.error("Module isolation violations:\n" + violations.join("\n"))
  process.exitCode = 1
} else
  console.log(
    "Module boundaries passed: no imports across modules or from the shell to a specific module."
  )
