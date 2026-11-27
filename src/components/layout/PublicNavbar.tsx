import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDealerStore } from '@/stores/dealer'
import { availableStock } from '@/data/query'
import IconBase from '@/components/ui/IconBase'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/estoque', key: 'nav.stock', end: false },
  { to: '/financiamento', key: 'nav.finance', end: false },
  { to: '/test-drive', key: 'nav.testDrive', end: false },
  { to: '/vender-meu-carro', key: 'nav.sellCar', end: false },
]

export default function PublicNavbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDark = useUiStore((s) => s.toggleDarkMode)
  const isAuth = useAuthStore((s) => s.user !== null)

  const vehicles = useDealerStore((s) => s.vehicles)
  const availableCount = availableStock(vehicles).length

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-body hover:text-heading'
    }`

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? 'surface-header border-themed backdrop-blur' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-theme-md">
            <IconBase name="car" size={18} />
          </span>
          <span className="text-lg font-bold text-heading">{t('brand')}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {t(l.key)}
              {l.to === '/estoque' && availableCount > 0 && (
                <span className="ml-1.5 rounded-full bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  {availableCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleDark}
            aria-label={t('common.theme')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-themed text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <IconBase name={darkMode ? 'sun' : 'moon'} size={18} />
          </button>
          <LanguageSwitcher />

          {isAuth ? (
            <Link
              to="/app"
              className="hidden h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 sm:flex"
            >
              {t('nav.dashboard')}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden h-10 items-center rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800 sm:flex"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/registro"
                className="hidden h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 sm:flex"
              >
                <IconBase name="user" size={16} />
                {t('nav.register')}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-body lg:hidden"
            aria-label="Menu"
          >
            <IconBase name={mobileOpen ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="surface-card border-t border-themed lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t(l.key)}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-themed pt-3">
              {isAuth ? (
                <Link
                  to="/app"
                  className="flex h-11 items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white"
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex h-11 items-center justify-center rounded-lg border border-themed text-sm font-medium text-body"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/registro"
                    className="flex h-11 items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
