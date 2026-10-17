# Hướng dẫn kiến trúc và quy ước dự án

## 1. Tổng quan kỹ thuật

Dự án dùng React, TypeScript strict, Vite, React Router, Tailwind và Zod. Giao diện được tổ chức theo module nghiệp vụ. Module Demo cung cấp trang Todos tại `/demo/todos`; đây là ví dụ để triển khai các module tiếp theo.

Ứng dụng có ba lớp chính:

| Lớp    | Trách nhiệm                                                       | Ví dụ                               |
| ------ | ----------------------------------------------------------------- | ----------------------------------- |
| Shell  | Khởi tạo ứng dụng, router, layout và menu                         | `main.tsx`, `router/`, `SiteHeader` |
| Core   | Công cụ và component dùng chung, không phụ thuộc nghiệp vụ cụ thể | HTTP client, Button, Dialog, theme  |
| Module | Type, API, state và UI của một nghiệp vụ                          | `modules/demo/`                     |

## 2. Cấu trúc thư mục

```text
src/
├── main.tsx                         # Entry point
├── App.tsx                          # Component gốc
├── index.css                        # Theme, Tailwind và style nền tảng
├── assets/
│   └── logos/                       # Asset được import bởi ứng dụng
├── core/
│   ├── api/
│   │   ├── config.ts                # Base URL công khai
│   │   └── client.ts                # HTTP transport, timeout, HTTP error
│   ├── components/
│   │   ├── site-header.tsx          # Header và tìm kiếm menu
│   │   ├── header-navigation.tsx    # Menu module và chức năng
│   │   ├── command-search.tsx       # Tìm kiếm chức năng
│   │   ├── app-states.tsx           # Empty shell và trang không tồn tại
│   │   ├── page-loading.tsx        # Loading khi lazy load page
│   │   └── ui/                     # Button, Input, Textarea, Dialog...
│   ├── providers/
│   │   └── theme-provider.tsx       # Theme context
│   └── types/
│       └── module.ts                # AppModule, ModuleRoute, ModulePageProps
├── router/
│   ├── registry.ts                  # Khám phá module và xây menu
│   ├── index.tsx                    # Layout và render route
│   └── hooks.ts                     # Hook điều hướng dùng chung
└── modules/
    └── demo/
        ├── module.ts                # Khai báo menu, icon, route
        ├── types/
        │   └── todo.ts              # Todo schema và các type
        ├── api/
        │   └── todos-api.ts         # Request nghiệp vụ Todos
        ├── hooks/
        │   └── use-todos.ts         # State danh sách và mutation
        ├── utils/
        │   └── todo-date.ts         # Chuyển đổi và định dạng ngày
        ├── components/
        │   ├── todo-form.tsx        # Form thêm/sửa
        │   └── todos-table.tsx      # Bảng danh sách
        └── pages/
            └── todos-page.tsx      # Route entry, ghép UI với hook

tests/
└── todos.spec.ts                    # Test luồng trình duyệt
scripts/
├── check-module-boundaries.mjs      # Kiểm tra ranh giới import
└── check-without-modules.mjs        # Kiểm tra shell độc lập với module
```

### Chọn nơi đặt code

- Hàm HTTP chung, không biết Todo là gì: `core/api/`.
- Request liên quan `/todos`: `modules/demo/api/`.
- Type và schema Todo: `modules/demo/types/`.
- State, lifecycle và orchestration CRUD: `modules/demo/hooks/`.
- Form và bảng Todo: `modules/demo/components/`.
- Điều khiển dialog, tìm kiếm và phân trang của màn hình: `modules/demo/pages/`.
- Hàm thuần xử lý ngày của Todo: `modules/demo/utils/`.
- Component đã được nhiều module sử dụng và không có logic riêng của Todo: `core/components/`.

Chỉ tạo thư mục khi có file tương ứng. Không gom mọi thứ vào `helpers.ts`, `common.ts` hoặc một page quá lớn. Không đưa logic riêng của module vào Core để tiện import.

## 3. Luồng khởi tạo và điều hướng

```text
main.tsx
  → StrictMode
  → ThemeProvider
  → BrowserRouter
  → App
  → AppRouter
      → MainLayout
          → SiteHeader
          → Outlet
              → TodosPage
  → Toaster
```

`main.tsx` gắn React vào `#root` và khai báo provider chung. `App.tsx` gọi router. `MainLayout` cung cấp header và vùng nội dung; page được render trong `Outlet`.

### Cách module được đăng ký

`router/registry.ts` đọc các file `src/modules/*/module.ts` qua `import.meta.glob`:

1. Lấy default export của từng module.
2. Lọc module có `enabled !== false`.
3. Sắp theo `order`, sau đó theo `id`.
4. Kiểm tra ID và route không trùng nhau.
5. Tạo danh sách menu và mục tìm kiếm từ route được phép xuất hiện trong navigation.
6. Chọn route đầu tiên trong menu làm `defaultPath`.

Router nhận metadata từ registry, dùng `lazy(route.load)` để tải page khi cần. `Suspense` hiển thị `PageLoading` trong thời gian tải code. Vào `/` chuyển đến `defaultPath`; route không tồn tại hiển thị `NotFound`. Nếu chưa có module khả dụng, shell hiển thị `EmptyModules`.

### Ví dụ khai báo module

```ts
// src/modules/demo/module.ts
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
```

`id` là định danh kỹ thuật ổn định, `title` là nhãn hiển thị. Route bắt đầu bằng `/`; không dùng `/` hoặc `*` làm route của module. Đặt `navigation: false` cho route không cần xuất hiện trong menu. Page phải có default export phù hợp `ModulePageProps`.

## 4. Ranh giới phụ thuộc

```text
Page ───────→ Component
 │                │
 │                └──→ Type / Utility / Core UI
 ↓
Hook ───────→ API module ───────→ Core HTTP client
 │                 │
 └──→ Type         └──→ Schema
```

- Page ghép các thành phần và điều khiển trạng thái giao diện.
- Component nhận dữ liệu qua props và phát hành động qua callback.
- Hook quản lý state và gọi API nghiệp vụ.
- API module biết endpoint, method, payload và response schema.
- HTTP client chỉ quản lý giao tiếp HTTP.
- Type và utility không import page hoặc component.
- Core không import module cụ thể.
- Module không import trực tiếp code nội bộ của module khác.

Ví dụ import:

```ts
// Dùng alias cho Core.
import { Button } from "@/core/components/ui/button"

// Dùng đường dẫn tương đối trong cùng module.
import { useTodos } from "../hooks/use-todos"
import type { Todo } from "../types/todo"
```

Khi hai module cùng cần một chức năng độc lập nghiệp vụ, thiết kế hợp đồng chung và đặt phần dùng chung ở Core. Không dùng import vòng hoặc import xuyên module làm lối tắt.

## 5. Quy tắc đặt tên

| Đối tượng                    | Quy tắc                                           | Ví dụ                                                 |
| ---------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Thư mục                      | `kebab-case`; nhóm chức năng thường là số nhiều   | `components`, `hooks`, `exam-results`                 |
| File                         | `kebab-case`, tên thể hiện trách nhiệm            | `todo-form.tsx`, `todos-api.ts`                       |
| Page                         | File kết thúc `-page.tsx`, component `PascalCase` | `todos-page.tsx`, `TodosPage`                         |
| Component                    | `PascalCase`                                      | `TodoForm`, `TodosTable`                              |
| Hook                         | Bắt đầu `use`, file `use-*.ts`                    | `useTodos`, `use-todos.ts`                            |
| Type/interface               | `PascalCase`, không thêm tiền tố `I`              | `Todo`, `TodoInput`, `TodoFormProps`                  |
| Biến/hàm                     | `camelCase`                                       | `dueDate`, `formatTodoDate`                           |
| Hằng cấu hình                | `UPPER_SNAKE_CASE`                                | `API_BASE_URL`, `PAGE_SIZE`                           |
| Callback prop                | `on` + hành động                                  | `onEdit`, `onDelete`, `onSubmit`                      |
| Handler                      | `handle` + hành động                              | `handleSubmit`, `handleDelete`                        |
| Hàm API                      | Động từ + đối tượng                               | `listTodos`, `createTodo`, `updateTodo`, `deleteTodo` |
| Danh sách                    | Số nhiều                                          | `todos`, `visibleTodos`, `searchResults`              |
| Một phần tử                  | Số ít                                             | `todo`, `selectedTodo`                                |
| Giá trị có thể không tồn tại | Tên thể hiện mục đích, type có `null`/`undefined` | `editingTodo: Todo \| null`                           |

### Tên state và boolean

Tên phải phân biệt được ý nghĩa của mỗi state:

```ts
const [todos, setTodos] = useState<Todo[]>([])
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [error, setError] = useState<string | null>(null)
const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

const canSubmit = !saving && task.trim().length > 0
const hasResults = todos.length > 0
```

`loading` dành cho tải danh sách, `saving` dành cho thao tác thay đổi dữ liệu. Với boolean phức tạp hơn, ưu tiên tiền tố `is`, `has`, `can`, `should`. Tránh tên `flag`, `status1`, `data2` hoặc `handleClick2`.

`id` trong dữ liệu Todo là chuỗi: không đổi sang số chỉ để dễ so sánh. Tên biến phải phản ánh đơn vị khi có nguy cơ nhầm: `seconds`, `milliseconds`, `pageSize`, `timeoutMs`.

## 6. Export và component

### Named export

Component tái sử dụng, hook, API và utility dùng named export để tên được thống nhất khi import:

```tsx
import type { Todo } from "../types/todo"

interface TodoCardProps {
  todo: Todo
  disabled?: boolean
  onEdit: (todo: Todo) => void
}

export function TodoCard({ todo, disabled = false, onEdit }: TodoCardProps) {
  return (
    <article>
      <h2>{todo.task}</h2>
      <button disabled={disabled} onClick={() => onEdit(todo)}>
        Sửa công việc
      </button>
    </article>
  )
}
```

```ts
import { TodoCard } from "../components/todo-card"
import { listTodos } from "../api/todos-api"
import { useTodos } from "../hooks/use-todos"
```

### Default export

Page dùng default export vì router lazy loader nhận `{ default: Component }`. `module.ts` dùng default export vì registry đọc `import: "default"`.

```tsx
import type { ModulePageProps } from "@/core/types/module"

export default function TodosPage({ title }: ModulePageProps) {
  return <h1>{title}</h1>
}
```

Không export cùng một hàm bằng cả hai cách. Không tạo barrel `index.ts` chỉ để gom một file; import trực tiếp giúp thấy nguồn phụ thuộc. Khi cần public API của một nhóm dùng chung, export rõ từng đối tượng thay vì `export *` hàng loạt.

### Phân chia trách nhiệm component

`TodosTable` render bảng và gọi `onEdit(todo)`; nó không gọi HTTP. `TodoForm` quản lý giá trị input, kiểm tra form và gọi `onSubmit(input)`. `TodosPage` mở/đóng dialog, kết nối callback với hook và hiển thị toast.

Thứ tự code trong component nên là: props → hook/state → dữ liệu suy ra → handler → JSX. Không gọi hook trong điều kiện. Ưu tiên function component có props cụ thể; không cần `React.FC`.

## 7. Type và kiểm tra dữ liệu

### Schema tại ranh giới API

TypeScript không kiểm tra JSON từ server ở runtime. Dữ liệu nhận từ client HTTP có type `unknown`; module dùng Zod kiểm tra trước khi trả cho UI.

```ts
import { z } from "zod"

export const todoSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  task: z.string(),
  dueDate: z.number().int(),
  desc: z.string(),
})

export type Todo = z.infer<typeof todoSchema>
export type TodoInput = Pick<Todo, "task" | "dueDate" | "desc">
```

Response có `id` và `createdAt`; form không phải tự tạo ID. `TodoInput` chỉ chứa các trường người dùng chỉnh sửa. Không sao chép nguyên response vào payload nếu endpoint chỉ nhận một số trường.

### `type` và `interface`

- Dùng `interface` cho hợp đồng props hoặc cấu trúc đối tượng cần đặt tên.
- Dùng `type` cho union, type suy ra, `Pick`, `Omit` và tổ hợp type.
- Dùng `import type` khi chỉ sử dụng một tên trong hệ thống type.
- Không dùng `any` để xử lý response hoặc lỗi.
- Không ép `as Todo` cho JSON chưa kiểm tra; dùng `todoSchema.parse`.

```ts
type EditorState = Todo | "new" | null

interface TodoFormProps {
  todo?: Todo
  saving: boolean
  onSubmit: (input: TodoInput) => Promise<void>
  onCancel: () => void
}
```

### Xử lý lỗi có type

```ts
try {
  await createTodo(input)
} catch (cause: unknown) {
  const message =
    cause instanceof Error ? cause.message : "Không lưu được công việc."
  setError(message)
}
```

Không đọc `cause.message` trước khi narrowing. `ApiError` chứa `status` để phân biệt lỗi HTTP nếu nghiệp vụ cần xử lý theo mã trạng thái.

## 8. Luồng request API

Base URL được cấu hình bắt buộc trong `.env`:

```text
VITE_DEMO_API_URL=<base-url-cua-api>
```

Cấu hình `VITE_DEMO_API_URL` qua môi trường Vite. `.env.example` chứa cấu hình mẫu; code không có URL dự phòng. Các giá trị `VITE_*` được đóng vào frontend; chỉ dùng cho cấu hình công khai. Test cũng đọc URL từ env. Khi thay env, khởi động lại dev server hoặc build lại.

```text
TodoForm.onSubmit(input)
  → TodosPage.handleSave(input)
  → useTodos.save(input, id?)
  → createTodo(input) hoặc updateTodo(id, input)
  → request(path, options)
  → fetch(baseUrl + path)
  → kiểm tra HTTP status
  → parse JSON
  → todoSchema.parse(response)
  → cập nhật todos
  → đóng dialog, hiển thị toast
```

| Hành động     | Method | Endpoint     | Payload                                |
| ------------- | ------ | ------------ | -------------------------------------- |
| Tải danh sách | GET    | `/todos`     | Không có                               |
| Tạo           | POST   | `/todos`     | `task`, `dueDate`, `desc`, `createdAt` |
| Sửa           | PUT    | `/todos/:id` | `task`, `dueDate`, `desc`              |
| Xóa           | DELETE | `/todos/:id` | Không có                               |

Ví dụ hàm API:

```ts
export async function updateTodo(id: string, input: TodoInput): Promise<Todo> {
  const response = await request(`/todos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })

  return todoSchema.parse(response)
}
```

Client chung đặt `Accept: application/json`, đặt `Content-Type` khi có body, timeout 15 giây và hỗ trợ `AbortSignal`. HTTP ngoài nhóm thành công phát sinh `ApiError`; response 204 không cần parse JSON. Việc encode ID thuộc API module.

## 9. Luồng state và CRUD

### Tải danh sách

1. Page mount và gọi `useTodos`.
2. Effect tạo `AbortController`, gọi API danh sách.
3. Response đã được kiểm tra schema cập nhật `todos`.
4. Khi hoàn tất, chuyển `loading` thành `false`.
5. Nếu thất bại, lưu `error` và hiện nút thử lại.

Reload hủy request cũ rồi bắt đầu request mới. Unmount hủy request đang chạy. Callback không cập nhật state từ request đã bị hủy.

### Thêm và sửa

1. Page chọn editor `"new"` hoặc Todo cần sửa.
2. Form khởi tạo input từ editor.
3. Submit trim tên và mô tả; kiểm tra tên không trống và ngày hợp lệ.
4. Hook khóa mutation bằng ref để ngăn thao tác đồng thời.
5. Hook hủy request danh sách đang chạy, tránh dữ liệu cũ ghi đè.
6. POST/PUT thành công trả Todo hợp lệ.
7. Thêm Todo mới đầu danh sách hoặc thay Todo có ID tương ứng.
8. Page đóng dialog và báo thành công.

Nếu lỗi, form giữ dữ liệu để người dùng sửa hoặc thử lại. Trong khi lưu, khóa input và nút submit. Không đóng dialog ngay trước khi biết kết quả request.

### Xóa

1. Người dùng chọn Todo cần xóa.
2. Dialog xác nhận hiển thị tên công việc.
3. Chỉ gửi DELETE sau khi bấm xác nhận.
4. Thành công thì loại ID khỏi state và đóng dialog.
5. Thất bại thì giữ dialog, hiển thị lỗi và cho thử lại.

### State thuộc lớp nào?

| State                                 | Nơi quản lý    | Lý do                          |
| ------------------------------------- | -------------- | ------------------------------ |
| `todos`, `loading`, `error`, `saving` | Hook           | Dữ liệu và trạng thái request  |
| `editor`, `viewing`, `deleting`       | Page           | Điều khiển màn hình/dialog     |
| `search`, `page`                      | Page           | Điều khiển danh sách hiển thị  |
| `task`, `desc`, `dueDate`, lỗi form   | Form           | Chỉ phục vụ thao tác nhập liệu |
| `filtered`, `visible`, tổng số trang  | Dữ liệu suy ra | Không cần tạo state riêng      |

### Cập nhật state từ state trước

```ts
setTodos((current) =>
  current.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
)

setTodos((current) => current.filter((todo) => todo.id !== deletedId))
```

Không sửa trực tiếp mảng hoặc object đang nằm trong state. Dùng functional update khi kết quả phụ thuộc state trước đó. Không tạo state riêng cho giá trị có thể tính từ dữ liệu hiện có.

## 10. Ngày giờ và phân trang

`dueDate` là Unix timestamp theo **giây**. JavaScript Date dùng **mili giây**:

```ts
const date = new Date(todo.dueDate * 1000)
const seconds = Math.floor(new Date(inputValue).getTime() / 1000)
```

`createdAt` là chuỗi ISO. `datetime-local` biểu diễn giờ địa phương của trình duyệt. Dùng `toDateTimeInput` để tạo chuỗi input từ các thành phần ngày địa phương; không dùng trực tiếp `toISOString().slice(0, 16)` vì ISO ở UTC. Khi người dùng không sửa ngày, giữ số giây gốc để không làm mất phần giây.

Danh sách hiện tải một lần và tìm kiếm/phân trang phía client:

```ts
const PAGE_SIZE = 10
const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
const activePage = Math.min(page, pages)
const visible = filtered.slice(
  (activePage - 1) * PAGE_SIZE,
  activePage * PAGE_SIZE
)
```

Đổi từ khóa đưa về trang 1. Sau khi xóa, `activePage` được giới hạn để không rơi vào trang vượt số trang còn lại. Nếu chuyển sang phân trang server, đưa page/search vào hook và API; không đồng thời phân trang lại response một cách không chủ đích.

## 11. Giao diện và comment

Sử dụng Tailwind và token theme như `bg-card`, `text-muted-foreground`, `border-border`, `text-primary`. Dùng các primitive Core như `Button`, `Input`, `Textarea`, `Dialog` để thống nhất tương tác và accessibility.

Input có label; nút chỉ có icon phải có `aria-label`; lỗi dùng `role="alert"`, loading dùng `role="status"`. Bảng rộng được cuộn trong container thay vì làm cả trang tràn ngang. Dữ liệu người dùng render như text, không đưa trực tiếp vào HTML.

Comment ghi rõ đơn vị, hợp đồng hoặc lý do của một quyết định:

```ts
// dueDate từ API là giây; Date nhận mili giây.
const date = new Date(todo.dueDate * 1000)

// Hủy tải danh sách trước mutation để response cũ không ghi đè dữ liệu mới.
loadController.current?.abort()
```

Không comment lặp lại cú pháp như “gán biến”, “return dữ liệu”. Không ghi nhật ký sửa code vào comment hoặc tài liệu kiến trúc. Không log payload nhạy cảm hoặc response đầy đủ.

## 12. Cách thêm chức năng và kiểm tra

### Thêm một module

1. Tạo `src/modules/<module-id>/module.ts` với hợp đồng `AppModule`.
2. Tạo page có default export và đăng ký dynamic import trong route.
3. Thiết kế schema/type trước khi xử lý response.
4. Đặt request vào `api`, orchestration vào hook, giao diện vào component/page.
5. Kiểm tra ID, route và ranh giới import.

### Thêm một field Todo

Ví dụ bổ sung `priority` khi API đã hỗ trợ:

1. Thêm `priority` vào schema, ví dụ `z.enum(["low", "medium", "high"])`.
2. Thêm field vào `TodoInput` nếu người dùng được phép chỉnh.
3. Thêm input và validation trong `TodoForm`.
4. Kiểm tra payload POST/PUT.
5. Hiển thị field trong bảng hoặc dialog chi tiết.
6. Cập nhật fixture và test cho field mới.

### Các lệnh kiểm tra

```sh
pnpm build                  # TypeScript + production build
pnpm lint                   # TypeScript/React lint
pnpm check:modules          # Core không import module; không import chéo module
pnpm test:e2e               # CRUD, lỗi/thử lại và layout trên trình duyệt
pnpm check:without-modules  # Shell hoạt động khi không có module
```

Test trình duyệt giả lập response API và kiểm tra request payload; không phụ thuộc dữ liệu đang có trên server. Đặt tên test theo hành vi: điều kiện → hành động → kết quả. Ưu tiên test luồng lưu/xóa, xử lý lỗi, cancellation, ngày giờ và phân trang thay vì test chỉ lặp lại JSX.
