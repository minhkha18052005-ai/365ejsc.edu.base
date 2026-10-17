
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/core/components/ui/button"
import type { Todo } from "../types/todo"

interface TodosTableProps {
  todos: Todo[]
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  onToggle: (id: string) => void
}

export function TodosTable({
  todos,
  onEdit,
  onDelete,
  onToggle,
}: TodosTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3">Công việc</th>
            <th className="px-4 py-3">Hạn hoàn thành</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {todos.map((todo) => (
            <tr key={todo.id}>
              <td className="px-4 py-3">
                <p className="font-medium">{todo.task}</p>
                <p className="text-xs text-muted-foreground">
                  {todo.desc || "Chưa có mô tả"}
                </p>
              </td>

              <td className="px-4 py-3">{todo.dueDate}</td>

              <td className="px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggle(todo.id)}
                >
                  {todo.completed
                    ? "Đã hoàn thành"
                    : "Chưa hoàn thành"}
                </Button>
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(todo)}
                  >
                    <Pencil className="size-4" />
                    Sửa
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(todo)}
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
