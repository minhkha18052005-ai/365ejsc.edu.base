import { Link } from "react-router-dom"
export function EmptyModules() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold">Chưa có module</h1>
      <p className="mt-2 text-muted-foreground">
        Ứng dụng sẵn sàng. Thêm module để bắt đầu.
      </p>
    </section>
  )
}
export function NotFound() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <Link to="/" className="mt-2 inline-block text-primary underline">
        Về trang chính
      </Link>
    </section>
  )
}
