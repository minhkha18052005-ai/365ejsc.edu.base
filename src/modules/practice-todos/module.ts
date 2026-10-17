import { ClipboardList, ListTodo } from "lucide-react"
import type { AppModule } from "@/core/types/module"

const practiceTodosModule: AppModule = {
  id: "practice-todos",
  title: "Thực hành tuần 4",
  order: 2,
  icon: ClipboardList,
  routes: [
    {
      path: "/practice/todos",
      title: "Quản lý công việc",
      icon: ListTodo,
      load: () => import("./pages/todos-page"),
    },
  ],
}

export default practiceTodosModule