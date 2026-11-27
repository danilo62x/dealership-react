import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/hooks/useNow'
import { TODAY_KEY } from '@/data/mock'
import { drivesOfDay, slowMovers, vehicleById, vehicleLabel } from '@/data/query'
import { formatDate } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function AppHeader() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const navigate = useNavigate()
  const now = useNow()

  const darkMode = useUiStore((s) => s.darkMode)
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toggleSidebarMobile = useUiStore((s) => s.toggleSidebarMobile)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const drives = useDealerStore((s) => s.drives)
  const deals = useDealerStore((s) => s.deals)
  const rules = useDealerStore((s) => s.rules)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)

  const initials = useMemo(() => {
    if (!user) return '?'
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('')
  }, [user])

  const notifications = useMemo(() => {
    const items: { id: string; text: string; time: string }[] = []

    for (const drive of drivesOfDay(drives, TODAY_KEY).slice(0, 2)) {
      const vehicle = vehicleById(vehicles, drive.vehicleId)
      if (!vehicle) continue
      items.push({
        id: `drive-${drive.id}`,
        text: t('notifications.driveToday', { name: vehicleLabel(models, brands, vehicle) }),
        time: `${drive.from}–${drive.to}`,
      })
    }

    for (const deal of [...deals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2)) {
      const vehicle = vehicleById(vehicles, deal.vehicleId)
      if (!vehicle) continue
      items.push({
        id: `deal-${deal.id}`,
        text: t('notifications.newDeal', { name: vehicleLabel(models, brands, vehicle) }),
        time: formatDate(deal.createdAt, lang),
      })
    }

    for (const row of slowMovers(vehicles, now, rules).slice(0, 1)) {
      items.push({
        id: `slow-${row.vehicle.id}`,
        text: t('notifications.slowStock', { name: vehicleLabel(models, brands, row.vehicle) }),
        time: t('common.daysCount', { count: row.days }),
      })
    }

    return items
  }, [drives, deals, vehicles, models, brands, rules, now, t, lang])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const onToggleSidebar = () => {
    if (window.innerWidth < 1024) toggleSidebarMobile()
    else toggleSidebar()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setDropdownOpen(false)
  }

  return (
    <header className="surface-header sticky top-0 z-30 flex w-full border-b">
      <div className="flex flex-grow items-center justify-between gap-4 px-4 py-3 md:px-6 2xl:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-themed text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <IconBase name="menu" size={20} />
          </button>

          <Link
            to="/app/estoque?novo=1"
            className="hidden h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 sm:flex"
          >
            <IconBase name="plus" size={18} />
            {t('appNav.newVehicle')}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-themed text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={toggleDarkMode}
            aria-label={t('common.theme')}
          >
            <IconBase name={darkMode ? 'sun' : 'moon'} size={18} />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-themed text-muted hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label={t('appNav.notifications')}
              onClick={() => setNotifOpen((s) => !s)}
            >
              <IconBase name="bell" size={18} />
              {notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-error-500" />
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="surface-card absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl border shadow-theme-lg">
                <div className="flex items-center justify-between border-b border-themed px-4 py-3">
                  <p className="text-sm font-semibold text-heading">{t('appNav.notifications')}</p>
                </div>
                <ul className="max-h-72 divide-y divide-themed overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-heading">{n.text}</p>
                        <p className="text-xs text-muted">{n.time}</p>
                      </div>
                    </li>
                  ))}
                  {!notifications.length && (
                    <li className="px-4 py-6 text-center text-sm text-muted">{t('common.noResults')}</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button type="button" className="ml-1 flex items-center gap-3" onClick={() => setDropdownOpen((s) => !s)}>
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-heading">{user?.name || '—'}</span>
                <span className="block text-xs text-muted">{user?.role || '—'}</span>
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white">
                {initials}
              </span>
              <IconBase name="chevron-down" size={16} className="text-muted" />
            </button>

            {dropdownOpen && (
              <div className="surface-card absolute right-0 mt-3 w-56 rounded-xl border shadow-theme-lg">
                <div className="border-b border-themed px-4 py-3">
                  <p className="truncate text-sm font-medium text-heading">{user?.name || '—'}</p>
                  <p className="truncate text-xs text-muted">{user?.email || ''}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      to="/app/configuracoes"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-body hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <IconBase name="settings" size={16} /> {t('appNav.settings')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-body hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <IconBase name="globe" size={16} /> {t('appNav.viewSite')}
                    </Link>
                  </li>
                </ul>
                <div className="border-t border-themed py-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10"
                    onClick={handleLogout}
                  >
                    <IconBase name="logout" size={16} /> {t('appNav.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
