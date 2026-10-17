import { z } from "zod"
// Runtime validation and static types share one source of truth.
export const todoSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  task: z.string(),
  dueDate: z.number().int(),
  desc: z.string(),
})
export type Todo = z.infer<typeof todoSchema>
export type TodoInput = Pick<Todo, "task" | "dueDate" | "desc">
