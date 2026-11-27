import IconBase from '@/components/ui/IconBase'

type Accent = 'brand' | 'success' | 'warning' | 'error' | 'info'

interface Props {
  title: string
  value: string | number
  hint?: string
  icon: string
  accent?: Accent
  trend?: 'up' | 'down'
  trendValue?: string
}

const BG: Record<Accent, string> = {
  brand: 'bg-brand-50 dark:bg-brand-500/15',
  success: 'bg-success-50 dark:bg-success-500/15',
  warning: 'bg-warning-50 dark:bg-warning-500/15',
  error: 'bg-error-50 dark:bg-error-500/15',
  info: 'bg-blue-light-50 dark:bg-blue-light-500/15',
}

const FG: Record<Accent, string> = {
  brand: 'text-brand-500',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-500',
  info: 'text-blue-light-500',
}

export default function KpiCard({ title, value, hint, icon, accent = 'brand', trend, trendValue }: Props) {
  return (
    <div className="surface-card rounded-2xl border p-5 shadow-theme-sm">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${BG[accent]}`}>
          <IconBase name={icon} size={20} className={FG[accent]} />
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend === 'up'
                ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
            }`}
          >
            <IconBase name={trend === 'up' ? 'arrow-up' : 'arrow-down'} size={12} strokeWidth={2.5} />
            {trendValue}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted">{title}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
