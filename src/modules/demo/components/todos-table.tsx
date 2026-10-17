import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/core/components/ui/button"
import type { Todo } from "../types/todo"
import { formatTodoDate } from "../utils/todo-date"

interface TodosTableProps {
  todos: Todo[]
  disabled: boolean
  onView: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodosTable({
  todos,
  disabled,
  onView,
  onEdit,
  onDelete,
}: TodosTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Công việc</th>
            <th className="px-5 py-3 font-medium">Hạn hoàn thành</th>
            <th className="px-5 py-3 font-medium">Ngày tạo</th>
            <th className="px-5 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {todos.map((todo) => (
            <tr key={todo.id} className="transition-colors hover:bg-muted/30">
              <td className="max-w-[360px] px-5 py-4">
                <div className="font-medium">{todo.task}</div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {todo.desc || "Chưa có mô tả"}
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                {formatTodoDate(todo.dueDate)}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                {formatTodoDate(todo.createdAt)}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Xem ${todo.task}`}
                    onClick={() => onView(todo)}
                  >
                    <Eye />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={disabled}
                    aria-label={`Sửa ${todo.task}`}
                    onClick={() => onEdit(todo)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={disabled}
                    aria-label={`Xóa ${todo.task}`}
                    onClick={() => onDelete(todo)}
                  >
                    <Trash2 />
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
