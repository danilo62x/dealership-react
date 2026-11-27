import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import IconBase from '@/components/ui/IconBase'

export default function NotFoundPage() {
  const { t } = useTranslation()
  usePageTitle(t('notFound.title'))

  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16 text-center"
      style={{ backgroundColor: 'var(--tx-body-bg)' }}
    >
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
        <IconBase name="car" size={36} />
      </span>
      <p className="mt-6 text-title-md font-bold text-heading">404</p>
      <h1 className="mt-1 text-xl font-semibold text-heading">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-sm text-muted">{t('notFound.text')}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <IconBase name="home" size={16} />
          {t('notFound.home')}
        </Link>
        <Link
          to="/estoque"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-themed px-5 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t('notFound.stock')}
        </Link>
      </div>
    </div>
  )
}
