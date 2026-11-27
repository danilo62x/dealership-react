import { type ReactNode } from 'react'
import Breadcrumb, { type Crumb } from '@/components/ui/Breadcrumb'

interface Props {
  title: string
  subtitle?: string
  crumbs?: Crumb[]
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, crumbs, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {crumbs && crumbs.length > 0 && (
          <div className="mb-2">
            <Breadcrumb items={crumbs} />
          </div>
        )}
        <h1 className="text-2xl font-bold text-heading">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
