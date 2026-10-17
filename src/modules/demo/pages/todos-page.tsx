import { useState } from "react"
import { ListTodo, Plus, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog"
import type { ModulePageProps } from "@/core/types/module"
import { useTodos } from "../hooks/use-todos"
import { TodoForm } from "../components/todo-form"
import { TodosTable } from "../components/todos-table"
import type { Todo, TodoInput } from "../types/todo"
import { formatTodoDate } from "../utils/todo-date"

const PAGE_SIZE = 10

/** Route entry: composes UI, delegates requests and mutations to useTodos. */
export default function TodosPage({ title }: ModulePageProps) {
  const { todos, loading, error, saving, reload, save, remove } = useTodos()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<Todo | "new" | null>(null)
  const [viewing, setViewing] = useState<Todo | null>(null)
  const [deleting, setDeleting] = useState<Todo | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const filtered = todos.filter((todo) =>
    `${todo.task} ${todo.desc}`
      .toLocaleLowerCase("vi")
      .includes(search.trim().toLocaleLowerCase("vi"))
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const activePage = Math.min(page, pages)
  const visible = filtered.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE
  )

  async function handleSave(input: TodoInput) {
    await save(input, editor && editor !== "new" ? editor.id : undefined)
    setEditor(null)
    toast.success("Đã lưu công việc.")
  }
  async function handleDelete() {
    if (!deleting || saving) return
    setDeleteError(null)
    try {
      await remove(deleting.id)
      setDeleting(null)
      toast.success("Đã xóa công việc.")
    } catch (cause: unknown) {
      setDeleteError(
        cause instanceof Error ? cause.message : "Không xóa được công việc."
      )
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
            Demo / Quản lý công việc
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý công việc, hạn hoàn thành và ghi chú với MockAPI.
          </p>
        </div>
        <Button onClick={() => setEditor("new")} disabled={loading || saving}>
          <Plus />
          Thêm công việc
        </Button>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <ListTodo className="size-5" />
          </span>
          <div>
            <strong className="text-lg">{todos.length}</strong>
            <span className="ml-2 text-sm text-muted-foreground">
              công việc
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Tìm công việc"
              className="pl-9"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Tìm tên hoặc mô tả…"
            />
          </div>
          <Button
            variant="outline"
            disabled={loading || saving}
            onClick={() => void reload()}
            aria-label="Tải lại danh sách"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-6"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void reload()}
          >
            Thử lại
          </Button>
        </div>
      ) : loading ? (
        <div
          role="status"
          className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground"
        >
          Đang tải công việc…
        </div>
      ) : visible.length ? (
        <TodosTable
          todos={visible}
          disabled={saving}
          onView={setViewing}
          onEdit={setEditor}
          onDelete={(todo) => {
            setDeleteError(null)
            setDeleting(todo)
          }}
        />
      ) : (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center">
          <ListTodo className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="font-medium">
            {search ? "Không có kết quả phù hợp" : "Chưa có công việc"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "Thử tìm với từ khóa khác."
              : "Thêm công việc đầu tiên để bắt đầu."}
          </p>
        </div>
      )}
      {!loading && !error && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {filtered.length} kết quả · Trang {activePage}/{pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={activePage === 1}
              onClick={() => setPage(activePage - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              disabled={activePage === pages}
              onClick={() => setPage(activePage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setEditor(null)
        }}
      >
        <DialogContent className="sm:max-w-lg" showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>
              {editor === "new" ? "Thêm công việc" : "Sửa công việc"}
            </DialogTitle>
            <DialogDescription>
              Điền tên, hạn hoàn thành và mô tả công việc.
            </DialogDescription>
          </DialogHeader>
          {editor !== null && (
            <TodoForm
              key={editor === "new" ? "new" : editor.id}
              todo={editor === "new" ? undefined : editor}
              saving={saving}
              onSubmit={handleSave}
              onCancel={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết công việc</DialogTitle>
            <DialogDescription>
              Thông tin được tải từ API Todos.
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="grid gap-4 text-sm">
              {[
                ["Tên công việc", viewing.task],
                ["Mô tả", viewing.desc || "Chưa có mô tả"],
                ["Hạn hoàn thành", formatTodoDate(viewing.dueDate)],
                ["Ngày tạo", formatTodoDate(viewing.createdAt)],
                ["ID", viewing.id],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-xs text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="break-words whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setDeleting(null)
        }}
      >
        <DialogContent showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>Xóa công việc?</DialogTitle>
            <DialogDescription>
              “{deleting?.task}” sẽ bị xóa. Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setDeleting(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={saving}
              onClick={() => void handleDelete()}
            >
              {saving ? "Đang xóa…" : "Xác nhận xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
