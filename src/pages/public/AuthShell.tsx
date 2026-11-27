import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IconBase from '@/components/ui/IconBase'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

/** Layout em branco das telas de autenticação. */
export default function AuthShell({ title, subtitle, children, footer }: Props) {
  const { t } = useTranslation()
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-10 dark:from-gray-900 dark:via-gray-dark dark:to-gray-900">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-warning-100/60 blur-3xl dark:bg-brand-700/10" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Link
            to="/"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-theme-md"
          >
            <IconBase name="car" size={26} />
          </Link>
          <h1 className="mt-5 text-title-sm font-bold text-heading">{title}</h1>
          <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>
        </div>

        <div className="surface-card rounded-2xl border p-6 shadow-theme-md md:p-8">{children}</div>

        {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}

        <p className="mt-6 text-center text-xs text-muted">
          <Link to="/" className="hover:text-brand-500">
            ← {t('brand')}
          </Link>
        </p>
      </div>
    </div>
  )
}
