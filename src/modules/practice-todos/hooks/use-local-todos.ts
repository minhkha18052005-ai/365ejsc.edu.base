import { useEffect, useState } from "react"
import type { Todo, TodoInput } from "../types/todo"

const initialTodos: Todo[] = [
  {
    id: "1",
    task: "Học React Component",
    desc: "Tìm hiểu Component, Props và State",
    dueDate: "2026-10-20",
    completed: false,
    createdAt: "2026-10-17",
  },
  {
    id: "2",
    task: "Thực hành CRUD",
    desc: "Thêm, xem, sửa và xóa bằng useState",
    dueDate: "2026-10-22",
    completed: false,
    createdAt: "2026-10-17",
  },
]
const STORAGE_KEY = "practice-todos-week4"

export function useLocalTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        return parsed as Todo[]
      }
    }
  } catch (error) {
    console.error("Không đọc được danh sách đã lưu:", error)
  }

  return initialTodos
})
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error("Không lưu được danh sách:", error)
  }
}, [todos])

  function addTodo(input: TodoInput) {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString().slice(0, 10),
    }

    setTodos((current) => [newTodo, ...current])
  }

  function updateTodo(id: string, input: TodoInput) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, ...input } : todo
      )
    )
  }

  function deleteTodo(id: string) {
    setTodos((current) =>
      current.filter((todo) => todo.id !== id)
    )
  }

  function toggleCompleted(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleCompleted,
  }
}
