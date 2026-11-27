import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/ui'
import IconBase from './IconBase'

interface Props {
  /** Levanta o banner quando a barra do player ocupa o rodapé. */
  offsetPx?: number
}

export default function CookieBanner({ offsetPx = 0 }: Props) {
  const { t } = useTranslation()
  const cookiesAccepted = useUiStore((s) => s.cookiesAccepted)
  const showCookieBanner = useUiStore((s) => s.showCookieBanner)
  const openCookieBanner = useUiStore((s) => s.openCookieBanner)
  const accept = useUiStore((s) => s.acceptCookies)
  const decline = useUiStore((s) => s.declineCookies)

  // Surface the banner on first visit (no choice persisted yet).
  useEffect(() => {
    if (!cookiesAccepted) {
      const id = setTimeout(() => openCookieBanner(), 800)
      return () => clearTimeout(id)
    }
  }, [cookiesAccepted, openCookieBanner])

  if (!showCookieBanner) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4" style={{ paddingBottom: 16 + offsetPx }}>
      <div className="surface-card mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border p-5 shadow-theme-xl sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
          <IconBase name="cookie" size={22} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-heading">{t('cookie.title')}</p>
          <p className="mt-0.5 text-xs text-muted">
            {t('cookie.desc')}{' '}
            <a href="#" className="font-medium text-brand-500 hover:text-brand-600">
              {t('cookie.policy')}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={decline}
            className="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('cookie.decline')}
          </button>
          <button
            type="button"
            onClick={accept}
            className="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
