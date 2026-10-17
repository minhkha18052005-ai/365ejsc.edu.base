import { useRouter } from "@/router/hooks"
import { Search, type LucideIcon } from "lucide-react"
import { searchItems } from "@/router/registry"

import { Button } from "@/core/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command"
import { Kbd } from "@/core/components/ui/kbd"

interface SearchItem {
  title: string
  url: string
  group: string
  icon?: LucideIcon
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter()

  const groupedItems = searchItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, SearchItem[]>
  )

  const handleSelect = (url: string) => {
    router.push(url)
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Search"
      description="Search pages and settings"
      className="sm:max-w-[640px]"
    >
      <Command>
        <CommandInput placeholder="What do you need?" autoFocus />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    onSelect={() => handleSelect(item.url)}
                  >
                    {Icon && <Icon />}
                    {item.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

export function SearchTrigger({
  onClick,
  inverse = false,
}: {
  onClick: () => void
  inverse?: boolean
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-label="Tìm kiếm (Ctrl/⌘ + K)"
      className={`h-8 w-8 justify-center px-0 font-normal sm:w-36 sm:justify-start sm:px-2 ${inverse ? "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:bg-white/10 dark:hover:bg-white/20" : "text-muted-foreground"}`}
    >
      <Search data-icon="inline-start" />
      <span className="hidden text-xs sm:inline">Tìm kiếm...</span>
      <Kbd
        className={`ml-auto hidden sm:inline-flex ${inverse ? "bg-white/15 text-white" : ""}`}
      >
        ⌘K
      </Kbd>
    </Button>
  )
}
