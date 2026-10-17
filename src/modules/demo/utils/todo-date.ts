/** dueDate is Unix seconds; browser Date expects milliseconds. */
export function toDateTimeInput(seconds: number): string {
  const date = new Date(seconds * 1000)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
export function formatTodoDate(value: number | string): string {
  return new Date(
    typeof value === "number" ? value * 1000 : value
  ).toLocaleString("vi-VN")
}
