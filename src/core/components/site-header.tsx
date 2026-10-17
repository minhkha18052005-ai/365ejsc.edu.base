import * as React from "react"
import { Separator } from "@/core/components/ui/separator"
import { CommandSearch, SearchTrigger } from "@/core/components/command-search"
import {
  HeaderNavigation,
  ModuleNavigation,
} from "@/core/components/header-navigation"
import Image from "@/core/components/app-image"
import Link from "@/core/components/router-link"
import logo from "@/assets/logos/emis-edu-logo.png"
import { defaultPath } from "@/router/registry"

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const setHeaderHeight = React.useCallback((node: HTMLElement | null) => {
    if (!node) return
    const apply = () => {
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${node.offsetHeight}px`
      )
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header
        ref={setHeaderHeight}
        className="sticky top-0 z-40 flex shrink-0 flex-col border-b border-border/70 bg-background shadow-[0_1px_3px_rgb(0_0_0/0.04)]"
      >
        <div className="flex min-h-11 w-full flex-wrap items-center gap-1 bg-white px-4 py-1 lg:gap-2 lg:px-6 dark:bg-background">
          <Link
            href={defaultPath ?? "/"}
            aria-label="Trang ch?nh"
            className="mr-1 flex shrink-0 items-center"
          >
            <Image
              src={logo}
              alt="eMIS EDU"
              width={120}
              height={40}
              className="h-9 w-28 object-contain"
            />
          </Link>
          <ModuleNavigation className="order-last w-full lg:order-none lg:w-auto lg:flex-1" />
          <div className="ml-auto flex shrink-0 items-center gap-1 border-l border-border/60 pl-2 lg:pl-3">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
            <Separator
              orientation="vertical"
              className="mx-1 data-vertical:h-4 data-vertical:self-center"
            />
          </div>
        </div>
        <HeaderNavigation className="flex w-full border-t border-border/50 bg-white px-4 lg:px-6 dark:bg-background" />
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
