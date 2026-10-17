
import { useState } from "react"
import { ListTodo, Plus } from "lucide-react"
import { Input } from "@/core/components/ui/input"
import type { ModulePageProps } from "@/core/types/module"
import { Button } from "@/core/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog"

import { useLocalTodos } from "../hooks/use-local-todos"
import { TodoForm } from "../components/todo-form"
import { TodosTable } from "../components/todos-table"
import type { Todo, TodoInput } from "../types/todo"

export default function TodosPage({ title }: ModulePageProps) {
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleCompleted,
  } = useLocalTodos()

  // null: đóng Form
  // "new": thêm mới
  // Todo: chỉnh sửa
  const [editor, setEditor] = useState<Todo | "new" | null>(null)
  const [deleting, setDeleting] = useState<Todo | null>(null)
  const [search, setSearch] = useState("")
const [status, setStatus] = useState("all")
const [page, setPage] = useState(1)

const PAGE_SIZE = 10

const filteredTodos = todos.filter((todo) => {
  const keyword = search.trim().toLocaleLowerCase("vi")

  const matchesSearch =
    `${todo.task} ${todo.desc}`
      .toLocaleLowerCase("vi")
      .includes(keyword)

  const matchesStatus =
    status === "all" ||
    (status === "completed" && todo.completed) ||
    (status === "pending" && !todo.completed)

  return matchesSearch && matchesStatus
})

const totalPages = Math.max(
  1,
  Math.ceil(filteredTodos.length / PAGE_SIZE)
)

const activePage = Math.min(page, totalPages)

const visibleTodos = filteredTodos.slice(
  (activePage - 1) * PAGE_SIZE,
  activePage * PAGE_SIZE
)

  function handleSave(input: TodoInput) {
    if (editor === "new") {
      addTodo(input)
    } else if (editor !== null) {
      updateTodo(editor.id, input)
    }

    setEditor(null)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-primary">
            React Developer / Tuần 4
          </p>

          <h1 className="text-2xl font-semibold">{title}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Thực hành CRUD với React State và TypeScript.
          </p>
        </div>

        <Button onClick={() => setEditor("new")}>
          <Plus className="size-4" />
          Thêm công việc
        </Button>
      </div>

<div className="mb-5 flex flex-wrap items-center gap-3">
  <Input
    className="w-full sm:max-w-sm"
    placeholder="Tìm tên hoặc mô tả công việc..."
    value={search}
    onChange={(event) => {
      setSearch(event.target.value)
      setPage(1)
    }}
  />

  <select
    aria-label="Lọc trạng thái"
    className="h-9 rounded-md border bg-background px-3 text-sm"
    value={status}
    onChange={(event) => {
      setStatus(event.target.value)
      setPage(1)
    }}
  >
    <option value="all">Tất cả</option>
    <option value="completed">Đã hoàn thành</option>
    <option value="pending">Chưa hoàn thành</option>
  </select>
</div>

      <div className="rounded-xl border bg-card p-6">
  <div className="mb-4 flex items-center gap-3">
    <ListTodo className="size-6 text-primary" />

    <h2 className="text-lg font-medium">
      Danh sách công việc ({todos.length})
    </h2>
  </div>

  {visibleTodos.length === 0 ? (
    <p className="text-sm text-muted-foreground">
  {todos.length === 0
    ? "Chưa có công việc nào."
    : "Không có kết quả phù hợp."}
</p>
  ) : (
   <TodosTable
  todos={visibleTodos}
  onEdit={setEditor}
  onDelete={setDeleting}
  onToggle={toggleCompleted}
    />
  )}
</div>

<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
  <p className="text-sm text-muted-foreground">
    {filteredTodos.length} kết quả — Trang {activePage}/{totalPages}
  </p>

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
      disabled={activePage === totalPages}
      onClick={() => setPage(activePage + 1)}
    >
      Sau
    </Button>
  </div>
</div>


      {/* Dialog thêm và sửa công việc */}
      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editor === "new"
                ? "Thêm công việc"
                : "Chỉnh sửa công việc"}
            </DialogTitle>

            <DialogDescription>
              Nhập đầy đủ thông tin công việc.
            </DialogDescription>
          </DialogHeader>

          {editor !== null && (
            <TodoForm
              key={editor === "new" ? "new" : editor.id}
              todo={editor === "new" ? undefined : editor}
              onSubmit={handleSave}
              onCancel={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Xác nhận xóa công việc
            </DialogTitle>

            <DialogDescription>
              Bạn có chắc chắn muốn xóa công việc{" "}
              <strong>{deleting?.task}</strong>?
              Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
            >
              Hủy
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (!deleting) return

                deleteTodo(deleting.id)
                setDeleting(null)
              }}
            >
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
