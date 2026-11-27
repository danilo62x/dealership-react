import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/hooks/useNow'
import { TODAY_KEY } from '@/data/mock'
import {
  customerById,
  drivesOfDay,
  funnel,
  salesByDay,
  sellerById,
  slowMovers,
  stockKpis,
  STAGES,
  vehicleById,
  vehicleLabel,
} from '@/data/query'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import ApexChart from '@/components/ui/ApexChart'
import EmptyState from '@/components/ui/EmptyState'
import IconBase from '@/components/ui/IconBase'
import KpiCard from '@/components/dl/KpiCard'
import { DriveStatusPill } from '@/components/dl/StockPill'

const STAGE_COLORS = ['#98a2b3', '#0aa295', '#f79009', '#12b76a', '#f04438']

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('dashboard.title'))
  const now = useNow()

  const vehicles = useDealerStore((s) => s.vehicles)
  const deals = useDealerStore((s) => s.deals)
  const drives = useDealerStore((s) => s.drives)
  const customers = useDealerStore((s) => s.customers)
  const sellers = useDealerStore((s) => s.sellers)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const rules = useDealerStore((s) => s.rules)

  const kpis = useMemo(() => stockKpis(vehicles, now, rules), [vehicles, now, rules])
  const rows = useMemo(() => funnel(deals, vehicles, 90, now), [deals, vehicles, now])
  const series = useMemo(() => salesByDay(vehicles, 30, now), [vehicles, now])
  const slow = useMemo(() => slowMovers(vehicles, now, rules), [vehicles, now, rules])
  const agenda = useMemo(() => drivesOfDay(drives, TODAY_KEY), [drives])

  const maxFunnel = Math.max(1, ...rows.map((r) => r.count))

  return (
    <div>
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t('dashboard.kpi.sales')}
          value={t('common.salesCount', { count: kpis.sales })}
          icon="handshake"
          accent="brand"
        />
        <KpiCard
          title={t('dashboard.kpi.ticket')}
          value={formatCurrency(kpis.avgTicket, lang)}
          icon="dollar"
          accent="success"
        />
        <KpiCard
          title={t('dashboard.kpi.margin')}
          value={formatCurrency(kpis.totalMargin, lang)}
          hint={kpis.revenue ? formatPercent(kpis.totalMargin / kpis.revenue, lang) : undefined}
          icon="trending-up"
          accent="info"
        />
        <KpiCard
          title={t('dashboard.kpi.turnover')}
          value={t('common.daysCount', { count: kpis.avgDays })}
          hint={t('dashboard.kpi.turnoverHint')}
          icon="clock"
          accent="warning"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* ---- Vendas por dia ---- */}
        <div className="surface-card rounded-2xl border p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-semibold text-heading">{t('dashboard.chartTitle')}</h2>
              <p className="mt-1 text-xs text-muted">{t('dashboard.chartSubtitle')}</p>
            </div>
            <p className="text-sm font-semibold text-heading">{formatCurrency(kpis.revenue, lang)}</p>
          </div>
          <div className="mt-4">
            <ApexChart
              type="area"
              height={280}
              series={[{ name: t('dashboard.chartSeries'), data: series.map((p) => p.value) }]}
              options={{
                xaxis: { categories: series.map((p) => p.label), tickAmount: 8 },
                yaxis: { labels: { formatter: (v: number) => formatCurrencyCompact(v, lang) } },
                fill: { type: 'gradient', gradient: { shadeIntensity: 0.4, opacityFrom: 0.35, opacityTo: 0.02 } },
              }}
            />
          </div>
        </div>

        {/* ---- Funil ---- */}
        <div className="surface-card rounded-2xl border p-5 md:p-6">
          <h2 className="font-semibold text-heading">{t('dashboard.funnelTitle')}</h2>
          <p className="mt-1 text-xs text-muted">{t('dashboard.funnelSubtitle')}</p>

          <ul className="mt-4 space-y-3">
            {rows.map((row, i) => (
              <li key={row.stage}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-heading">{t(`status.deal.${row.stage}`)}</span>
                  <span className="text-muted">
                    {t('common.dealsCount', { count: row.count })} · {formatCurrencyCompact(row.value, lang)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((row.count / maxFunnel) * 100)}%`,
                      backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length],
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/app/propostas"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            {t('appNav.deals')}
            <IconBase name="arrow-right" size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {/* ---- Giro lento ---- */}
        <div className="surface-card rounded-2xl border p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-semibold text-heading">{t('dashboard.slowTitle')}</h2>
              <p className="mt-1 text-xs text-muted">{t('dashboard.slowSubtitle', { days: rules.slowStockDays })}</p>
            </div>
            <span className="rounded-full bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-700 dark:bg-warning-500/15 dark:text-warning-500">
              {slow.length}
            </span>
          </div>

          {slow.length ? (
            <ul className="mt-4 divide-y divide-themed">
              {slow.slice(0, 6).map((row) => (
                <li key={row.vehicle.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/app/veiculo/${row.vehicle.id}`}
                      className="block truncate text-sm font-medium text-heading hover:text-brand-600"
                    >
                      {vehicleLabel(models, brands, row.vehicle)}
                    </Link>
                    <p className="text-xs text-muted">
                      {t('common.daysCount', { count: row.days })} · {formatCurrency(row.vehicle.price, lang)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-warning-600 dark:text-warning-500">
                      −{formatPercent(row.suggestedDiscountPct, lang)}
                    </p>
                    <p className="text-xs text-muted">
                      {t('dashboard.suggested')}: {formatCurrency(row.suggestedPrice, lang)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">{t('dashboard.slowEmpty')}</p>
          )}
        </div>

        {/* ---- Agenda de hoje ---- */}
        <div className="surface-card rounded-2xl border p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-semibold text-heading">{t('dashboard.agendaTitle')}</h2>
            <Link to="/app/test-drives" className="text-sm font-medium text-brand-500 hover:text-brand-600">
              {t('common.viewAll')}
            </Link>
          </div>

          {agenda.length ? (
            <ul className="mt-4 divide-y divide-themed">
              {agenda.slice(0, 6).map((drive) => {
                const vehicle = vehicleById(vehicles, drive.vehicleId)
                return (
                  <li key={drive.id} className="flex items-center gap-3 py-3">
                    <span className="w-14 shrink-0 text-sm font-semibold text-heading">{drive.from}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-heading">
                        {vehicle ? vehicleLabel(models, brands, vehicle) : '—'}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {customerById(customers, drive.customerId)?.name ?? '—'} ·{' '}
                        {sellerById(sellers, drive.sellerId)?.name ?? '—'}
                      </p>
                    </div>
                    <DriveStatusPill status={drive.status} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState icon="calendar" title={t('dashboard.agendaEmpty')} />
          )}
        </div>
      </div>
    </div>
  )
}
