import { LoaderCircle } from "lucide-react"

export function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40rem] flex-col items-center justify-center gap-4 px-5 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/5">
        <LoaderCircle
          aria-hidden="true"
          className="size-6 animate-spin text-primary motion-reduce:animate-none"
          strokeWidth={1.6}
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Đang tải nội dung
      </p>
    </div>
  )
}
