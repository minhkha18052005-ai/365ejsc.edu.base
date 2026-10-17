export interface Todo {
  id: string
  task: string
  desc: string
  dueDate: string
  completed: boolean
  createdAt: string
}

export type TodoInput = Pick<
  Todo,
  "task" | "desc" | "dueDate" | "completed"
>
