import type { ReactNode } from 'react'
import IconBase from './IconBase'

interface Props {
  search?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
  action?: ReactNode
}

/** Toolbar with a search input plus arbitrary filter controls (selects, etc.). */
export default function FilterBar({ search, onSearch, searchPlaceholder, children, action }: Props) {
  return (
    <div className="surface-card mb-5 flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center">
      {onSearch && (
        <div className="relative w-full lg:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <IconBase name="search" size={16} />
          </span>
          <input
            value={search ?? ''}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="focus-ring w-full rounded-lg border border-themed bg-transparent py-2 pr-3 pl-9 text-sm text-body"
          />
        </div>
      )}
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      {action && <div className="lg:ml-auto">{action}</div>}
    </div>
  )
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  label?: string
}

export function FilterSelect({ value, onChange, children, label }: SelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {label && <span className="whitespace-nowrap">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body"
      >
        {children}
      </select>
    </label>
  )
}
