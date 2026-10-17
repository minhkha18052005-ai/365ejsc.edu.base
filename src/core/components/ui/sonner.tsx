import { type CSSProperties } from "react"
import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/core/providers/theme-provider"

export function Toaster() {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme}
      position="top-right"
      closeButton
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans",
          title: "text-sm font-medium",
          description: "text-xs",
        },
      }}
    />
  )
}
