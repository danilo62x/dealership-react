import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/hooks/useNow'
import { dlImage } from '@/data/mock'
import {
  appraiseTradeIn,
  commission,
  commissionRate,
  customerById,
  dealById,
  dealPrice,
  margin,
  marginPct,
  modelLabel,
  sellerById,
  simulate,
  tradeInById,
  vehicleById,
  vehicleLabel,
  yearLabel,
} from '@/data/query'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import IconBase from '@/components/ui/IconBase'
import Avatar from '@/components/ui/Avatar'
import FinanceMemo from '@/components/dl/FinanceMemo'
import AppraisalBreakdown from '@/components/dl/AppraisalBreakdown'
import { ConditionPill, DealStagePill } from '@/components/dl/StockPill'

export default function DealPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const now = useNow()

  const deals = useDealerStore((s) => s.deals)
  const vehicles = useDealerStore((s) => s.vehicles)
  const customers = useDealerStore((s) => s.customers)
  const sellers = useDealerStore((s) => s.sellers)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const tradeIns = useDealerStore((s) => s.tradeIns)
  const rules = useDealerStore((s) => s.rules)
  const saveDeal = useDealerStore((s) => s.saveDeal)
  const moveDeal = useDealerStore((s) => s.moveDeal)
  const closeSale = useDealerStore((s) => s.closeSale)
  const setTradeInAccepted = useDealerStore((s) => s.setTradeInAccepted)
  const notify = useUiStore((s) => s.notify)

  const deal = useMemo(() => dealById(deals, Number(id)), [deals, id])
  const vehicle = deal ? vehicleById(vehicles, deal.vehicleId) : undefined
  const label = vehicle ? vehicleLabel(models, brands, vehicle) : t('deal.notFound')
  usePageTitle(`${t('deal.title')} #${id}`)

  const tradeIn = deal?.tradeInId ? tradeInById(tradeIns, deal.tradeInId) : undefined
  const appraisal = useMemo(
    () => (tradeIn ? appraiseTradeIn(tradeIn, models, rules, now) : null),
    [tradeIn, models, rules, now]
  )
  const tradeValue = tradeIn?.accepted && appraisal ? appraisal.value : 0

  const [discount, setDiscount] = useState(deal?.discount ?? 0)

  const simulation = useMemo(() => {
    if (!deal?.finance || !vehicle) return null
    return simulate(
      {
        price: Math.max(0, vehicle.price - discount),
        down: deal.finance.down,
        months: deal.finance.months,
        rate: deal.finance.monthlyRate,
        tradeIn: tradeValue,
      },
      rules
    )
  }, [deal, vehicle, discount, tradeValue, rules])

  if (!deal || !vehicle) {
    return (
      <div className="surface-card rounded-2xl border">
        <EmptyState
          icon="handshake"
          title={t('deal.notFound')}
          action={
            <Link to="/app/propostas" className="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white">
              {t('deal.backToBoard')}
            </Link>
          }
        />
      </div>
    )
  }

  const customer = customerById(customers, deal.customerId)
  const seller = sellerById(sellers, deal.sellerId)
  const finalPrice = Math.max(0, vehicle.price - discount)
  const marginValue = margin(vehicle, finalPrice)
  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  const applyDiscount = () => {
    saveDeal({ id: deal.id, discount })
    notify(t('vehicleAdmin.saved'), 'success')
  }

  return (
    <div>
      <PageHeader
        title={`${t('deal.title')} #${deal.id}`}
        subtitle={`${customer?.name ?? '—'} · ${formatDate(deal.createdAt, lang)}`}
        crumbs={[
          { label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' },
          { label: t('deals.title'), href: '/app/propostas' },
          { label: `#${deal.id}` },
        ]}
        action={
          <Link
            to="/app/propostas"
            className="focus-ring flex h-11 items-center gap-2 rounded-lg border border-themed px-5 text-sm font-medium text-body"
          >
            <IconBase name="arrow-right" size={16} className="rotate-180" />
            {t('deal.backToBoard')}
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-5">
          {/* ---- Veículo ---- */}
          <section className="surface-card rounded-2xl border p-5 md:p-6">
            <h2 className="mb-4 font-semibold text-heading">{t('deal.vehicleSection')}</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <img
                src={dlImage(vehicle.photoSeeds[0] ?? vehicle.slug, 320, 220)}
                alt={label}
                className="h-32 w-full shrink-0 rounded-xl object-cover sm:w-48"
              />
              <div className="min-w-0 flex-1">
                <Link to={`/app/veiculo/${vehicle.id}`} className="font-semibold text-heading hover:text-brand-600">
                  {label}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  {yearLabel(vehicle)} · {formatNumber(vehicle.km, lang)} km · {vehicle.color}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <DealStagePill stage={deal.stage} />
                  <span className="text-sm font-bold text-heading">{formatCurrency(vehicle.price, lang)}</span>
                </div>
                {deal.stage === 'perdida' && deal.lostReason && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-error-600 dark:text-error-500">
                    <IconBase name="ban" size={14} />
                    {t('deals.lostReason')}: {deal.lostReason}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ---- Financiamento ---- */}
          <section className="surface-card rounded-2xl border p-5 md:p-6">
            <h2 className="mb-4 font-semibold text-heading">{t('deal.financeSection')}</h2>
            {simulation ? (
              <>
                <dl className="mb-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-themed p-3.5">
                    <dt className="text-xs text-muted">{t('finance.down')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-heading">{formatCurrency(simulation.down, lang)}</dd>
                  </div>
                  <div className="rounded-xl border border-themed p-3.5">
                    <dt className="text-xs text-muted">{t('finance.months')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-heading">
                      {t('finance.monthsUnit', { months: simulation.months })}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-themed p-3.5">
                    <dt className="text-xs text-muted">{t('finance.installment')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {formatCurrency(simulation.installment, lang)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-themed p-3.5">
                    <dt className="text-xs text-muted">{t('finance.cet')}</dt>
                    <dd className="mt-1 text-sm font-semibold text-heading">
                      {(simulation.cet * 100).toFixed(2).replace('.', ',')}%
                    </dd>
                  </div>
                </dl>
                <FinanceMemo simulation={simulation} bare />
              </>
            ) : (
              <p className="text-sm text-muted">{t('deal.noFinance')}</p>
            )}
          </section>

          {/* ---- Troca ---- */}
          <section className="surface-card rounded-2xl border p-5 md:p-6">
            <h2 className="mb-4 font-semibold text-heading">{t('deal.tradeSection')}</h2>
            {tradeIn && appraisal ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-medium text-heading">{modelLabel(models, brands, tradeIn.modelId)}</span>
                  <span className="text-muted">
                    {tradeIn.year} · {formatNumber(tradeIn.km, lang)} km
                  </span>
                  <ConditionPill condition={tradeIn.condition} />
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      tradeIn.accepted
                        ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {tradeIn.accepted ? t('appraisal.accepted') : t('appraisal.pending')}
                  </span>
                </div>

                <AppraisalBreakdown appraisal={appraisal} bare />

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTradeInAccepted(tradeIn.id, !tradeIn.accepted)
                      notify(t('appraisals.updated'), 'success')
                    }}
                    className="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
                  >
                    {tradeIn.accepted ? t('deal.rejectTrade') : t('deal.acceptTrade')}
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted">{t('appraisal.applyToDeal')}</p>
              </>
            ) : (
              <p className="text-sm text-muted">{t('deal.noTrade')}</p>
            )}
          </section>
        </div>

        {/* ---- Desconto e aprovação ---- */}
        <aside className="min-w-0 space-y-5">
          <section className="surface-card rounded-2xl border p-5 md:p-6">
            <h2 className="mb-4 font-semibold text-heading">{t('deal.approvalSection')}</h2>

            <div className="mb-4 flex items-center gap-3">
              <Avatar src={seller?.avatar} name={seller?.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">{seller?.name ?? '—'}</p>
                <p className="truncate text-xs text-muted">{customer?.name ?? '—'}</p>
              </div>
            </div>

            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="d-discount">
              {t('deal.discount')}
            </label>
            <input
              id="d-discount"
              type="number"
              min={0}
              max={vehicle.price}
              step={100}
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              className={control}
            />

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('deal.finalPrice')}</dt>
                <dd className="font-semibold text-heading">{formatCurrency(finalPrice, lang)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('deal.marginAfter')}</dt>
                <dd
                  className={`font-semibold ${
                    marginValue < 0 ? 'text-error-600 dark:text-error-500' : 'text-success-600 dark:text-success-500'
                  }`}
                >
                  {formatCurrency(marginValue, lang)}
                  <span className="ml-1 text-xs font-normal text-muted">
                    {formatPercent(marginPct(vehicle, finalPrice), lang)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('deal.commission')}</dt>
                <dd className="font-semibold text-heading">
                  {formatCurrency(commission(marginValue, rules), lang)}
                  <span className="ml-1 text-xs font-normal text-muted">
                    {formatPercent(commissionRate(marginValue, rules), lang)}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={applyDiscount}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body"
              >
                <IconBase name="edit" size={16} />
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  moveDeal(deal.id, 'aprovada')
                  notify(t('deals.reserved', { name: label }), 'warning')
                }}
                disabled={deal.stage === 'aprovada'}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-success-500 text-sm font-medium text-white transition hover:bg-success-600 disabled:opacity-50"
              >
                <IconBase name="check-circle" size={16} />
                {t('deal.approve')}
              </button>
              <button
                type="button"
                onClick={() => {
                  closeSale(deal.id)
                  notify(t('deal.closed'), 'success')
                }}
                disabled={deal.stage !== 'aprovada'}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                <IconBase name="dollar" size={16} />
                {t('deal.closeSale')}
              </button>
              <button
                type="button"
                onClick={() => {
                  moveDeal(deal.id, 'perdida', 'Desistiu da compra')
                  notify(t('deals.released', { name: label }), 'info')
                }}
                disabled={deal.stage === 'perdida'}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-error-200 text-sm font-medium text-error-600 transition hover:bg-error-50 disabled:opacity-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
              >
                <IconBase name="ban" size={16} />
                {t('deal.lose')}
              </button>
            </div>

            <p className="mt-4 text-xs text-muted">{t('deals.approvedNote')}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
