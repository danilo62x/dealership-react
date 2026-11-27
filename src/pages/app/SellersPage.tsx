import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/hooks/useNow'
import { sellerPerformance } from '@/data/query'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import ApexChart from '@/components/ui/ApexChart'
import Avatar from '@/components/ui/Avatar'
import CommissionTable from '@/components/dl/CommissionTable'

export default function SellersPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('sellers.title'))
  const now = useNow()

  const sellers = useDealerStore((s) => s.sellers)
  const deals = useDealerStore((s) => s.deals)
  const vehicles = useDealerStore((s) => s.vehicles)
  const rules = useDealerStore((s) => s.rules)

  const rows = useMemo(
    () => sellerPerformance(sellers, deals, vehicles, now, rules),
    [sellers, deals, vehicles, now, rules]
  )

  return (
    <div>
      <PageHeader
        title={t('sellers.title')}
        subtitle={t('sellers.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('sellers.title') }]}
      />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="surface-card overflow-hidden rounded-2xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-themed text-xs text-muted">
                  <th className="px-5 py-3 font-medium">{t('sellers.columns.seller')}</th>
                  <th className="px-5 py-3 font-medium">{t('sellers.columns.sales')}</th>
                  <th className="px-5 py-3 font-medium">{t('sellers.columns.goal')}</th>
                  <th className="px-5 py-3 font-medium">{t('sellers.columns.revenue')}</th>
                  <th className="px-5 py-3 font-medium">{t('sellers.columns.margin')}</th>
                  <th className="px-5 py-3 font-medium">{t('sellers.columns.commission')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.seller.id} className="border-b border-themed last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={row.seller.avatar} name={row.seller.name} size="sm" />
                        <div className="min-w-0">
                          <span className="block truncate font-medium text-heading">{row.seller.name}</span>
                          <span className="block truncate text-xs text-muted">
                            {t('sellers.since', { date: formatDate(row.seller.since, lang) })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-heading">{row.sales}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-muted">
                        {t('sellers.goalProgress', { done: row.sales, goal: row.goal })}
                      </span>
                      <span className="mt-1 block h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <span
                          className={`block h-full rounded-full ${row.goalPct >= 1 ? 'bg-success-500' : 'bg-brand-500'}`}
                          style={{ width: `${Math.min(100, Math.round(row.goalPct * 100))}%` }}
                        />
                      </span>
                    </td>
                    <td className="px-5 py-3 text-body">{formatCurrency(row.revenue, lang)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          row.margin < 0
                            ? 'font-medium text-error-600 dark:text-error-500'
                            : 'font-medium text-success-600 dark:text-success-500'
                        }
                      >
                        {formatCurrency(row.margin, lang)}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-brand-600 dark:text-brand-400">
                      {formatCurrency(row.commission, lang)}
                      {row.margin > 0 && (
                        <span className="ml-1 text-xs font-normal text-muted">
                          {formatPercent(row.commission / row.margin, lang)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card rounded-2xl border p-5 md:p-6">
            <h2 className="font-semibold text-heading">{t('sellers.columns.commission')}</h2>
            <div className="mt-3">
              <ApexChart
                type="bar"
                height={260}
                series={[{ name: t('sellers.columns.commission'), data: rows.map((r) => r.commission) }]}
                options={{
                  xaxis: { categories: rows.map((r) => r.seller.name.split(' ')[0]) },
                  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
                }}
              />
            </div>
          </div>

          <CommissionTable />
        </div>
      </div>
    </div>
  )
}
