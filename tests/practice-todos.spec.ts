
import { test, expect } from "@playwright/test"

test("Practice Todos: thêm công việc và lưu sau refresh", async ({ page }) => {
  // Mở module thực hành
  await page.goto("/practice/todos")

  // Xóa dữ liệu test từ localStorage để tránh ảnh hưởng lần chạy trước
  await page.evaluate(() => {
    localStorage.removeItem("practice-todos-week4")
  })

  await page.reload()

  // Mở form thêm công việc
  await page.getByRole("button", { name: "Thêm công việc" }).click()

  // Nhập dữ liệu
  await page.getByLabel("Tên công việc").fill("Kiểm thử Playwright")

  await page.getByLabel("Hạn hoàn thành").fill("2026-10-30")

  await page.getByLabel("Mô tả").fill("Kiểm tra lưu dữ liệu")

  // Lưu công việc
  await page.getByRole("button", { name: "Thêm công việc" }).last().click()

  // Kiểm tra dữ liệu có xuất hiện
  await expect(
    page.getByRole("cell", { name: /Kiểm thử Playwright/ })
  ).toBeVisible()

  // Refresh và kiểm tra dữ liệu vẫn tồn tại
  await page.reload()

  await expect(
    page.getByRole("cell", { name: /Kiểm thử Playwright/ })
  ).toBeVisible()
})

test("Practice Todos: sửa, đổi trạng thái và xóa công việc", async ({ page }) => {
  await page.goto("/practice/todos")

  // Chuẩn bị dữ liệu test riêng
  await page.evaluate(() => {
    localStorage.setItem(
      "practice-todos-week4",
      JSON.stringify([
        {
          id: "test-1",
          task: "Công việc kiểm thử",
          desc: "Mô tả ban đầu",
          dueDate: "2026-10-30",
          completed: false,
          createdAt: "2026-10-17",
        },
      ])
    )
  })

  await page.reload()

  const row = page.getByRole("row").filter({
    hasText: "Công việc kiểm thử",
  })

  // Kiểm tra sửa
  await row.getByRole("button", { name: "Sửa" }).click()

  await page.getByLabel("Tên công việc").fill("Công việc đã sửa")

  await page.getByRole("button", { name: "Lưu thay đổi" }).click()

  await expect(
    page.getByRole("row").filter({ hasText: "Công việc đã sửa" })
  ).toBeVisible()

  // Kiểm tra đổi trạng thái
  const updatedRow = page.getByRole("row").filter({
    hasText: "Công việc đã sửa",
  })

  await updatedRow.getByRole("button", {
    name: "Chưa hoàn thành",
  }).click()

  await expect(
    updatedRow.getByRole("button", { name: "Đã hoàn thành", exact: true })
  ).toBeVisible()

  // Kiểm tra xóa
  await updatedRow.getByRole("button", { name: "Xóa" }).click()

  await page.getByRole("button", {
    name: "Xác nhận xóa",
  }).click()

  await expect(
    page.getByRole("row").filter({ hasText: "Công việc đã sửa" })
  ).toHaveCount(0)
})

test("Practice Todos: tìm kiếm và lọc trạng thái", async ({ page }) => {
  await page.goto("/practice/todos")

  // Chuẩn bị dữ liệu kiểm thử
  await page.evaluate(() => {
    localStorage.setItem(
      "practice-todos-week4",
      JSON.stringify([
        {
          id: "search-1",
          task: "Học React",
          desc: "Component và Props",
          dueDate: "2026-10-30",
          completed: false,
          createdAt: "2026-10-17",
        },
        {
          id: "search-2",
          task: "Hoàn thành báo cáo",
          desc: "Báo cáo tuần 4",
          dueDate: "2026-10-31",
          completed: true,
          createdAt: "2026-10-17",
        },
      ])
    )
  })

  await page.reload()

  const search = page.getByPlaceholder(
    "Tìm tên hoặc mô tả công việc..."
  )

  // Kiểm tra tìm kiếm
  await search.fill("React")

  await expect(
    page.getByRole("row").filter({ hasText: "Học React" })
  ).toBeVisible()

  await expect(
    page.getByRole("row").filter({ hasText: "Hoàn thành báo cáo" })
  ).toHaveCount(0)

  // Xóa từ khóa và lọc trạng thái
  await search.clear()

  await page.getByRole("combobox", {
    name: "Lọc trạng thái",
  }).selectOption("completed")

  await expect(
    page.getByRole("row").filter({ hasText: "Hoàn thành báo cáo" })
  ).toBeVisible()

  await expect(
    page.getByRole("row").filter({ hasText: "Học React" })
  ).toHaveCount(0)
})

test("Practice Todos: kiểm tra validation khi thêm công việc", async ({ page }) => {
  await page.goto("/practice/todos")

  // Mở Dialog thêm
  await page.getByRole("button", {
    name: "Thêm công việc",
  }).click()

  // Nhập tên chỉ chứa khoảng trắng
  await page.getByLabel("Tên công việc").fill("   ")

  // Nhập hạn hoàn thành hợp lệ
  await page.getByLabel("Hạn hoàn thành").fill("2026-10-30")

  // Nhấn nút submit trong Dialog
  await page.getByRole("dialog")
    .getByRole("button", { name: "Thêm công việc" })
    .click()

  // Kiểm tra thông báo validation từ Zod
  await expect(
    page.getByText("Vui lòng nhập tên công việc.")
  ).toBeVisible()

  // Dialog phải vẫn mở
  await expect(page.getByRole("dialog")).toBeVisible()
})

test("Practice Todos: phân trang danh sách công việc", async ({ page }) => {
  await page.goto("/practice/todos")

  // Tạo 15 công việc để kiểm tra phân trang
  await page.evaluate(() => {
    const todos = Array.from({ length: 15 }, (_, index) => ({
      id: `pagination-${index + 1}`,
      task: `Công việc ${index + 1}`,
      desc: `Mô tả ${index + 1}`,
      dueDate: "2026-10-30",
      completed: false,
      createdAt: "2026-10-17",
    }))

    localStorage.setItem(
      "practice-todos-week4",
      JSON.stringify(todos)
    )
  })

  await page.reload()

  // Trang 1 có 10 công việc
  await expect(page.getByRole("row")).toHaveCount(11)

  await expect(
    page.getByText("Trang 1/2")
  ).toBeVisible()

  // Sang trang 2
  await page.getByRole("button", { name: "Sau" }).click()

  // Trang 2 có 5 công việc
  await expect(page.getByRole("row")).toHaveCount(6)

  await expect(
    page.getByText("Trang 2/2")
  ).toBeVisible()

  // Quay lại trang đầu
  await page.getByRole("button", { name: "Trước" }).click()

  await expect(
    page.getByText("Trang 1/2")
  ).toBeVisible()
})
