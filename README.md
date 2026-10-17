# Demo Admin

React + TypeScript + Vite. Ứng dụng công khai, không cần đăng nhập; menu **Demo → Todos** có CRUD với MockAPI.

```sh
pnpm install
pnpm dev
```

Tạo `.env` theo `.env.example` và cấu hình `VITE_DEMO_API_URL`, sau đó mở `/demo/todos`. URL API được đọc hoàn toàn từ env.

```sh
pnpm build
pnpm lint
pnpm check:modules
pnpm test:e2e
pnpm check:without-modules
```

Xem [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) để biết cấu trúc thư mục, quy ước tên/export, type, API, xử lý CRUD và cách thêm module mới.
