import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: number
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: number[]
  onChange: (values: number[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'All',
  className,
}: MultiSelectProps) {
  const toggle = (value: number) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === options.length
      ? 'All selected'
      : `${selected.length} selected`

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            className
          )}
        >
          <span className={cn('truncate', selected.length === 0 && 'text-muted-foreground')}>
            {displayText}
          </span>
          <div className="flex items-center gap-1">
            {selected.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                onClick={clearAll}
                onKeyDown={e => e.key === 'Enter' && clearAll(e as unknown as React.MouseEvent)}
                className="rounded hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3 opacity-50" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          sideOffset={4}
        >
          {options.map(opt => {
            const isChecked = selected.includes(opt.value)
            return (
              <DropdownMenu.Item
                key={opt.value}
                onSelect={e => {
                  e.preventDefault()
                  toggle(opt.value)
                }}
                className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent/20 focus:text-accent-foreground"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {isChecked && <Check className="h-4 w-4 text-primary" />}
                </span>
                {opt.label}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
