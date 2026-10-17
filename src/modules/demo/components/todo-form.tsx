import { useState, type FormEvent } from "react"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Textarea } from "@/core/components/ui/textarea"
import type { Todo, TodoInput } from "../types/todo"
import { toDateTimeInput } from "../utils/todo-date"

interface TodoFormProps {
  todo?: Todo
  saving: boolean
  onSubmit: (input: TodoInput) => Promise<void>
  onCancel: () => void
}

export function TodoForm({ todo, saving, onSubmit, onCancel }: TodoFormProps) {
  const [task, setTask] = useState(todo?.task ?? "")
  const [desc, setDesc] = useState(todo?.desc ?? "")
  const [dueDate, setDueDate] = useState(
    todo ? toDateTimeInput(todo.dueDate) : ""
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    if (!task.trim()) {
      setError("Vui lòng nhập tên công việc.")
      return
    }
    const seconds = Math.floor(new Date(dueDate).getTime() / 1000)
    if (!Number.isFinite(seconds)) {
      setError("Vui lòng chọn hạn hoàn thành hợp lệ.")
      return
    }
    setError(null)
    try {
      // Preserve original seconds if the user did not change the date input.
      await onSubmit({
        task: task.trim(),
        desc: desc.trim(),
        dueDate:
          todo && dueDate === toDateTimeInput(todo.dueDate)
            ? todo.dueDate
            : seconds,
      })
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Không lưu được công việc."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <fieldset disabled={saving} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Tên công việc{" "}
          <Input
            value={task}
            onChange={(event) => setTask(event.target.value)}
            maxLength={200}
            required
            autoFocus
            placeholder="Ví dụ: Chuẩn bị báo cáo tuần"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Hạn hoàn thành{" "}
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Mô tả{" "}
          <Textarea
            value={desc}
            onChange={(event) => setDesc(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Ghi chú hoặc nội dung cần thực hiện"
          />
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu công việc"}
        </Button>
      </div>
    </form>
  )
}
