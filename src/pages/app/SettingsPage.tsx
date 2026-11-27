import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useDealerStore } from '@/stores/dealer'
import { STORE } from '@/data/mock'
import { LANGUAGES } from '@/i18n'
import { formatCurrency, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import Tabs from '@/components/ui/Tabs'
import SwitchToggle from '@/components/ui/SwitchToggle'
import IconBase from '@/components/ui/IconBase'
import CommissionTable from '@/components/dl/CommissionTable'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('settings.title'))
  const [tab, setTab] = useState(0)

  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  const darkMode = useUiStore((s) => s.darkMode)
  const setDarkMode = useUiStore((s) => s.setDarkMode)
  const openCookieBanner = useUiStore((s) => s.openCookieBanner)
  const notify = useUiStore((s) => s.notifySuccess)

  const rules = useDealerStore((s) => s.rules)
  const saveRules = useDealerStore((s) => s.saveRules)
  const reset = useDealerStore((s) => s.reset)

  const [store, setStore] = useState({
    legalName: STORE.legalName,
    address: STORE.address,
    phone: STORE.phone,
    whatsapp: STORE.whatsapp,
    email: STORE.email,
    hours: STORE.hours,
  })

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  const profileTab = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="p-name">
          {t('settings.profile.name')}
        </label>
        <input
          id="p-name"
          value={user?.name ?? ''}
          onChange={(e) => updateProfile({ name: e.target.value })}
          className={control}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="p-email">
          {t('settings.profile.email')}
        </label>
        <input
          id="p-email"
          type="email"
          value={user?.email ?? ''}
          onChange={(e) => updateProfile({ email: e.target.value })}
          className={control}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="p-role">
          {t('settings.profile.role')}
        </label>
        <input
          id="p-role"
          value={user?.role ?? ''}
          onChange={(e) => updateProfile({ role: e.target.value })}
          className={control}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="p-store">
          {t('settings.profile.store')}
        </label>
        <input
          id="p-store"
          value={user?.store ?? ''}
          onChange={(e) => updateProfile({ store: e.target.value })}
          className={control}
        />
      </div>
    </div>
  )

  const storeTab = (
    <div className="grid gap-4 sm:grid-cols-2">
      {(
        [
          ['legalName', 'settings.store.legalName'],
          ['address', 'settings.store.address'],
          ['phone', 'settings.store.phone'],
          ['whatsapp', 'settings.store.whatsapp'],
          ['email', 'settings.store.email'],
          ['hours', 'settings.store.hours'],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor={`s-${key}`}>
            {t(label)}
          </label>
          <input
            id={`s-${key}`}
            value={store[key]}
            onChange={(e) => setStore({ ...store, [key]: e.target.value })}
            className={control}
          />
        </div>
      ))}
    </div>
  )

  const rulesTab = (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-rate">
            {t('settings.rules.defaultMonthlyRate')}
          </label>
          <input
            id="r-rate"
            type="number"
            step={0.01}
            value={(rules.defaultMonthlyRate * 100).toFixed(2)}
            onChange={(e) => saveRules({ defaultMonthlyRate: Number(e.target.value) / 100 })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-down">
            {t('settings.rules.minDownPct')}
          </label>
          <input
            id="r-down"
            type="number"
            step={1}
            value={Math.round(rules.minDownPct * 100)}
            onChange={(e) => saveRules({ minDownPct: Number(e.target.value) / 100 })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-fee">
            {t('settings.rules.registrationFee')}
          </label>
          <input
            id="r-fee"
            type="number"
            value={rules.registrationFee}
            onChange={(e) => saveRules({ registrationFee: Number(e.target.value) })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-iof">
            {t('settings.rules.iocPct')}
          </label>
          <input
            id="r-iof"
            type="number"
            step={0.01}
            value={(rules.iocPct * 100).toFixed(2)}
            onChange={(e) => saveRules({ iocPct: Number(e.target.value) / 100 })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-slow">
            {t('settings.rules.slowStockDays')}
          </label>
          <input
            id="r-slow"
            type="number"
            value={rules.slowStockDays}
            onChange={(e) => saveRules({ slowStockDays: Number(e.target.value) })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-dep">
            {t('settings.rules.depreciationPerYear')}
          </label>
          <input
            id="r-dep"
            type="number"
            step={0.5}
            value={(rules.depreciationPerYear * 100).toFixed(1)}
            onChange={(e) => saveRules({ depreciationPerYear: Number(e.target.value) / 100 })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-km">
            {t('settings.rules.kmPerYearRef')}
          </label>
          <input
            id="r-km"
            type="number"
            step={500}
            value={rules.kmPerYearRef}
            onChange={(e) => saveRules({ kmPerYearRef: Number(e.target.value) })}
            className={control}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="r-kmadj">
            {t('settings.rules.kmAdjustPer1000')}
          </label>
          <input
            id="r-kmadj"
            type="number"
            step={10}
            value={rules.kmAdjustPer1000}
            onChange={(e) => saveRules({ kmAdjustPer1000: Number(e.target.value) })}
            className={control}
          />
        </div>
      </div>

      <div className="rounded-xl border border-themed p-4 text-sm text-muted">
        {t('finance.minDown', { value: formatCurrency(100000 * rules.minDownPct, lang) })} ·{' '}
        {t('finance.rate')} {formatPercent(rules.defaultMonthlyRate, lang)} · {t('settings.rules.slowStockDays')}{' '}
        {rules.slowStockDays}
      </div>

      <CommissionTable />
    </div>
  )

  const prefsTab = (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-themed p-4">
        <div>
          <p className="text-sm font-medium text-heading">{t('settings.preferences.darkMode')}</p>
        </div>
        <SwitchToggle checked={darkMode} onChange={setDarkMode} />
      </div>

      <div className="rounded-xl border border-themed p-4">
        <p className="mb-2 text-sm font-medium text-heading">{t('settings.preferences.language')}</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => i18n.changeLanguage(language.code)}
              className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                i18n.language === language.code
                  ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'border-themed text-body'
              }`}
            >
              <span aria-hidden>{language.flag}</span>
              {language.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-themed p-4">
        <p className="text-sm font-medium text-heading">{t('settings.preferences.cookies')}</p>
        <button
          type="button"
          onClick={openCookieBanner}
          className="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
        >
          {t('common.open')}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-error-200 p-4 dark:border-error-500/30">
        <div className="min-w-0">
          <p className="text-sm font-medium text-heading">{t('settings.preferences.reset')}</p>
          <p className="mt-0.5 text-xs text-muted">{t('settings.preferences.resetHint')}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset()
            notify(t('settings.preferences.resetDone'))
          }}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-error-200 px-4 py-2 text-sm font-medium text-error-600 transition hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
        >
          <IconBase name="refresh-cw" size={16} />
          {t('settings.preferences.reset')}
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('settings.title') }]}
        action={
          <button
            type="button"
            onClick={() => notify(t('settings.saved'))}
            className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <IconBase name="check" size={16} />
            {t('common.save')}
          </button>
        }
      />

      <div className="surface-card rounded-2xl border p-5 md:p-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { label: t('settings.tabs.profile'), icon: 'user', content: profileTab },
            { label: t('settings.tabs.store'), icon: 'store', content: storeTab },
            { label: t('settings.tabs.rules'), icon: 'calculator', content: rulesTab },
            { label: t('settings.tabs.preferences'), icon: 'settings', content: prefsTab },
          ]}
        />
      </div>
    </div>
  )
}
