import { useCallback, useEffect, useRef, useState } from "react"
import { createTodo, deleteTodo, listTodos, updateTodo } from "../api/todos-api"
import type { Todo, TodoInput } from "../types/todo"
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const mutationPending = useRef(false)
  const loadController = useRef<AbortController | null>(null)
  const load = useCallback(
    (controller: AbortController) =>
      listTodos(controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) setTodos(data)
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted)
            setError(
              cause instanceof Error
                ? cause.message
                : "Không tải được danh sách."
            )
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        }),
    []
  )
  const reload = useCallback(() => {
    loadController.current?.abort()
    const controller = new AbortController()
    loadController.current = controller
    setLoading(true)
    setError(null)
    return load(controller)
  }, [load])
  useEffect(() => {
    const controller = new AbortController()
    loadController.current = controller
    void load(controller)
    return () => loadController.current?.abort()
  }, [load])
  /** Serialize mutations and cancel stale list responses before changing data. */
  const mutate = useCallback(async (operation: () => Promise<void>) => {
    if (mutationPending.current)
      throw new Error("Một thao tác đang được xử lý.")
    mutationPending.current = true
    loadController.current?.abort()
    setLoading(false)
    setSaving(true)
    try {
      await operation()
    } finally {
      mutationPending.current = false
      setSaving(false)
    }
  }, [])
  const save = (input: TodoInput, id?: string) =>
    mutate(async () => {
      const todo = id ? await updateTodo(id, input) : await createTodo(input)
      setTodos((current) =>
        id
          ? current.map((item) => (item.id === id ? todo : item))
          : [todo, ...current]
      )
    })
  const remove = (id: string) =>
    mutate(async () => {
      await deleteTodo(id)
      setTodos((current) => current.filter((item) => item.id !== id))
    })
  return { todos, loading, error, saving, reload, save, remove }
}
