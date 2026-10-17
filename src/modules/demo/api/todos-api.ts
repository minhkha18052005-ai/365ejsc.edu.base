import { z } from "zod"
import { request } from "@/core/api/client"
import { todoSchema, type Todo, type TodoInput } from "../types/todo"
export async function listTodos(signal?: AbortSignal): Promise<Todo[]> {
  return z.array(todoSchema).parse(await request("/todos", { signal }))
}
export async function createTodo(input: TodoInput): Promise<Todo> {
  return todoSchema.parse(
    await request("/todos", {
      method: "POST",
      body: JSON.stringify({ ...input, createdAt: new Date().toISOString() }),
    })
  )
}
export async function updateTodo(id: string, input: TodoInput): Promise<Todo> {
  return todoSchema.parse(
    await request(`/todos/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })
  )
}
export async function deleteTodo(id: string): Promise<void> {
  await request(`/todos/${encodeURIComponent(id)}`, { method: "DELETE" })
}
