import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/hooks/useNow'
import { slowMovers } from '@/data/query'
import IconBase from '@/components/ui/IconBase'

interface NavItem {
  to: string
  labelKey: string
  icon: string
  end?: boolean
}

const SECTIONS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: 'appNav.salesSection',
    items: [
      { to: '/app', labelKey: 'appNav.dashboard', icon: 'dashboard', end: true },
      { to: '/app/propostas', labelKey: 'appNav.deals', icon: 'handshake' },
      { to: '/app/test-drives', labelKey: 'appNav.drives', icon: 'steering' },
    ],
  },
  {
    titleKey: 'appNav.stockSection',
    items: [
      { to: '/app/estoque', labelKey: 'appNav.stock', icon: 'car' },
      { to: '/app/avaliacoes', labelKey: 'appNav.appraisals', icon: 'calculator' },
    ],
  },
  {
    titleKey: 'appNav.peopleSection',
    items: [
      { to: '/app/clientes', labelKey: 'appNav.customers', icon: 'users' },
      { to: '/app/vendedores', labelKey: 'appNav.sellers', icon: 'user-check' },
    ],
  },
  {
    titleKey: 'appNav.accountSection',
    items: [{ to: '/app/configuracoes', labelKey: 'appNav.settings', icon: 'settings' }],
  },
]

export default function AppSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const now = useNow()

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const sidebarMobileOpen = useUiStore((s) => s.sidebarMobileOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const toggleSidebarMobile = useUiStore((s) => s.toggleSidebarMobile)
  const logout = useAuthStore((s) => s.logout)

  const vehicles = useDealerStore((s) => s.vehicles)
  const rules = useDealerStore((s) => s.rules)
  const slow = slowMovers(vehicles, now, rules).length

  const navLinkClass = (active: boolean) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      sidebarCollapsed ? 'justify-center' : ''
    } ${active ? 'is-sidebar-active' : 'is-sidebar-inactive'}`

  return (
    <aside
      style={{ width: sidebarCollapsed ? '90px' : '280px' }}
      className={`surface-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r px-4 transition-[transform,width] duration-300 lg:static lg:translate-x-0 ${
        sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className={`flex items-center pb-6 pt-7 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <NavLink to="/app" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-theme-sm">
            <IconBase name="car" size={18} />
          </span>
          {!sidebarCollapsed && (
            <span data-brand-text className="text-lg font-semibold">
              {t('brand')}
            </span>
          )}
        </NavLink>
        {!sidebarCollapsed && (
          <button
            type="button"
            className="is-sidebar-inactive hidden h-8 w-8 items-center justify-center rounded-lg border border-themed lg:flex"
            onClick={toggleSidebar}
            title={t('appNav.collapse')}
          >
            <IconBase name="chevron-right" size={14} className="rotate-180" />
          </button>
        )}
      </div>

      <div className="no-scrollbar flex flex-col gap-5 overflow-y-auto pb-4">
        {SECTIONS.map((section) => (
          <nav key={section.titleKey}>
            {!sidebarCollapsed && (
              <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider">{t(section.titleKey)}</h3>
            )}
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => navLinkClass(isActive)}
                    title={sidebarCollapsed ? t(item.labelKey) : undefined}
                    onClick={() => toggleSidebarMobile(false)}
                  >
                    <IconBase name={item.icon} size={20} />
                    {!sidebarCollapsed && <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>}
                    {!sidebarCollapsed && item.to === '/app/estoque' && slow > 0 && (
                      <span className="rounded-full bg-warning-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {slow}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-auto space-y-3 border-t border-themed py-4">
        {!sidebarCollapsed && (
          <div className="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
            <p className="text-xs font-medium text-muted">{t('appNav.slowTitle')}</p>
            <p className="mt-0.5 text-sm font-semibold text-heading">{t('appNav.slowDesc', { count: slow })}</p>
            <NavLink
              to="/app/estoque?giro=lento"
              className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-brand-500 text-xs font-medium text-white transition hover:bg-brand-600"
            >
              {t('appNav.openSlow')}
            </NavLink>
          </div>
        )}
        <button
          type="button"
          className={navLinkClass(false)}
          title={sidebarCollapsed ? t('appNav.logout') : undefined}
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <IconBase name="logout" size={20} />
          {!sidebarCollapsed && <span>{t('appNav.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
