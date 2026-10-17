import { FlaskConical, ListTodo } from "lucide-react"
import type { AppModule } from "@/core/types/module"
const demoModule: AppModule = {
  id: "demo",
  title: "Demo",
  order: 1,
  icon: FlaskConical,
  routes: [
    {
      path: "/demo/todos",
      title: "Todos",
      icon: ListTodo,
      load: () => import("./pages/todos-page"),
    },
  ],
}
export default demoModule
