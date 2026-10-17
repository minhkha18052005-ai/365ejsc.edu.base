// Cấu hình công khai bắt buộc: tạo .env theo .env.example trước khi chạy.
const configuredUrl = import.meta.env.VITE_DEMO_API_URL?.trim()

if (!configuredUrl) {
  throw new Error("Thiếu VITE_DEMO_API_URL. Hãy cấu hình trong file .env.")
}

const parsedUrl = new URL(configuredUrl)
if (!["http:", "https:"].includes(parsedUrl.protocol)) {
  throw new Error("VITE_DEMO_API_URL phải là URL HTTP hoặc HTTPS.")
}

export const API_BASE_URL = configuredUrl.replace(/\/+$/, "")
