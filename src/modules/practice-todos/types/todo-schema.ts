
import { z } from "zod"

export const todoFormSchema = z.object({
  task: z.string()
    .trim()
    .min(1, "Vui lòng nhập tên công việc.")
    .max(200, "Tên công việc không được quá 200 ký tự."),

  desc: z.string()
    .trim()
    .max(2000, "Mô tả không được quá 2000 ký tự."),

  dueDate: z.string()
    .min(1, "Vui lòng chọn hạn hoàn thành.")
    .refine(
      (value) => Number.isFinite(new Date(value).getTime()),
      "Hạn hoàn thành không hợp lệ."
    ),

  completed: z.boolean(),
})

export type TodoFormValues = z.infer<typeof todoFormSchema>
