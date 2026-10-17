import Link from "@/core/components/router-link"
import { usePathname } from "@/router/hooks"
import { modules, getNavigation } from "@/router/registry"

export function ModuleNavigation({ className = "" }: { className?: string }) {
  const active = getNavigation(usePathname())
  return (
    <nav
      aria-label="Phân hệ"
      className={`flex min-w-0 items-center overflow-x-auto py-0.5 ${className}`}
    >
      {modules.map(({ title, icon: Icon, items }) => (
        <Link
          key={title}
          href={items[0].href}
          aria-current={active?.module.title === title ? "true" : undefined}
          className={`relative flex h-8 shrink-0 items-center gap-1.5 px-3 text-menu font-semibold transition-colors after:absolute after:top-1/2 after:right-0 after:h-3 after:w-px after:-translate-y-1/2 after:bg-border last:after:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active?.module.title === title ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <Icon aria-hidden="true" className="size-3.5" />
          {title}
        </Link>
      ))}
    </nav>
  )
}

export function HeaderNavigation({ className = "" }: { className?: string }) {
  const active = getNavigation(usePathname())
  if (!active) return null
  return (
    <nav
      aria-label={`Chức năng ${active.module.title}`}
      className={`items-center overflow-x-auto ${className}`}
    >
      {active.module.items.map(({ title, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active.item.href === href ? "page" : undefined}
          className={`flex h-8 shrink-0 items-center gap-1.5 border-b-2 px-2.5 text-menu font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${active.item.href === href ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
        >
          <Icon aria-hidden="true" className="size-3.5" />
          {title}
        </Link>
      ))}
    </nav>
  )
}
