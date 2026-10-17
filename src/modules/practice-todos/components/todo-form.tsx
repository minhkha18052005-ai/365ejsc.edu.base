
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Textarea } from "@/core/components/ui/textarea"

import type { Todo, TodoInput } from "../types/todo"
import {
  todoFormSchema,
  type TodoFormValues,
} from "../types/todo-schema"

interface TodoFormProps {
  todo?: Todo
  onSubmit: (input: TodoInput) => void
  onCancel: () => void
}

export function TodoForm({
  todo,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      task: todo?.task ?? "",
      desc: todo?.desc ?? "",
      dueDate: todo?.dueDate ?? "",
      completed: todo?.completed ?? false,
    },
  })

  function submit(values: TodoFormValues) {
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="task" className="text-sm font-medium">
          Tên công việc
        </label>
        <Input
          id="task"
          {...register("task")}
          placeholder="Nhập tên công việc"
        />
        {errors.task && (
          <p className="text-sm text-destructive">
            {errors.task.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Hạn hoàn thành
        </label>
        <Input
          id="dueDate"
          type="date"
          {...register("dueDate")}
        />
        {errors.dueDate && (
          <p className="text-sm text-destructive">
            {errors.dueDate.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="desc" className="text-sm font-medium">
          Mô tả
        </label>
        <Textarea
          id="desc"
          rows={4}
          {...register("desc")}
          placeholder="Nhập mô tả công việc"
        />
        {errors.desc && (
          <p className="text-sm text-destructive">
            {errors.desc.message}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("completed")} />
        Đã hoàn thành
      </label>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {todo ? "Lưu thay đổi" : "Thêm công việc"}
        </Button>
      </div>
    </form>
  )
}
