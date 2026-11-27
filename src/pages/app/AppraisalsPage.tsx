import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/hooks/useNow'
import { appraiseTradeIn, customerById, modelLabel } from '@/data/query'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import FilterBar, { FilterSelect } from '@/components/ui/FilterBar'
import Drawer from '@/components/ui/Drawer'
import IconBase from '@/components/ui/IconBase'
import AppraisalBreakdown from '@/components/dl/AppraisalBreakdown'
import { ConditionPill } from '@/components/dl/StockPill'
import type { TradeIn } from '@/data/types'

export default function AppraisalsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('appraisals.title'))
  const now = useNow()

  const tradeIns = useDealerStore((s) => s.tradeIns)
  const customers = useDealerStore((s) => s.customers)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const rules = useDealerStore((s) => s.rules)
  const setTradeInAccepted = useDealerStore((s) => s.setTradeInAccepted)
  const notify = useUiStore((s) => s.notifySuccess)

  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<TradeIn | null>(null)

  const rows = useMemo(() => {
    const lower = term.trim().toLowerCase()
    return tradeIns
      .filter((tradeIn) => {
        if (status === 'accepted' && !tradeIn.accepted) return false
        if (status === 'pending' && tradeIn.accepted) return false
        if (!lower) return true
        const customer = customerById(customers, tradeIn.customerId)
        const model = modelLabel(models, brands, tradeIn.modelId)
        return `${customer?.name ?? ''} ${model}`.toLowerCase().includes(lower)
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [tradeIns, customers, models, brands, term, status])

  const detail = selected ? appraiseTradeIn(selected, models, rules, now) : null

  return (
    <div>
      <PageHeader
        title={t('appraisals.title')}
        subtitle={t('appraisals.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('appraisals.title') }]}
      />

      <FilterBar search={term} onSearch={setTerm} searchPlaceholder={t('common.search')}>
        <FilterSelect value={status} onChange={setStatus} label={t('common.status')}>
          <option value="">{t('common.all')}</option>
          <option value="accepted">{t('appraisal.accepted')}</option>
          <option value="pending">{t('appraisal.pending')}</option>
        </FilterSelect>
      </FilterBar>

      {rows.length ? (
        <div className="surface-card overflow-hidden rounded-2xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-themed text-xs text-muted">
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.customer')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.model')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.year')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.km')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.condition')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.value')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.deal')}</th>
                  <th className="px-5 py-3 font-medium">{t('appraisals.columns.accepted')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 30).map((tradeIn) => {
                  const appraisal = appraiseTradeIn(tradeIn, models, rules, now)
                  return (
                    <tr
                      key={tradeIn.id}
                      className="cursor-pointer border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
                      onClick={() => setSelected(tradeIn)}
                    >
                      <td className="px-5 py-3 font-medium text-heading">
                        {customerById(customers, tradeIn.customerId)?.name ?? '—'}
                        <span className="block text-xs font-normal text-muted">
                          {formatDate(tradeIn.createdAt, lang)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-body">{modelLabel(models, brands, tradeIn.modelId)}</td>
                      <td className="px-5 py-3 text-body">{tradeIn.year}</td>
                      <td className="px-5 py-3 text-body">{formatNumber(tradeIn.km, lang)}</td>
                      <td className="px-5 py-3">
                        <ConditionPill condition={tradeIn.condition} />
                      </td>
                      <td className="px-5 py-3 font-semibold text-heading">
                        {formatCurrency(appraisal.value, lang)}
                      </td>
                      <td className="px-5 py-3 text-body">
                        {tradeIn.dealId ? (
                          <Link
                            to={`/app/proposta/${tradeIn.dealId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-brand-500 hover:text-brand-600"
                          >
                            #{tradeIn.dealId}
                          </Link>
                        ) : (
                          <span className="text-muted">{t('appraisals.standalone')}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            tradeIn.accepted
                              ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {tradeIn.accepted ? t('appraisal.accepted') : t('appraisal.pending')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="surface-card rounded-2xl border">
          <EmptyState icon="calculator" title={t('appraisals.empty')} description={t('appraisals.emptyDesc')} />
        </div>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('appraisals.detail')}
        subtitle={selected ? modelLabel(models, brands, selected.modelId) : undefined}
        width="max-w-lg"
        footer={
          selected && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTradeInAccepted(selected.id, true)
                  notify(t('appraisals.updated'))
                  setSelected(null)
                }}
                className="focus-ring flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-success-500 text-sm font-medium text-white transition hover:bg-success-600"
              >
                <IconBase name="check" size={16} />
                {t('appraisals.accept')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTradeInAccepted(selected.id, false)
                  notify(t('appraisals.updated'))
                  setSelected(null)
                }}
                className="focus-ring flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body"
              >
                <IconBase name="x" size={16} />
                {t('appraisals.reject')}
              </button>
            </div>
          )
        }
      >
        {selected && detail && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-themed p-3">
                <dt className="text-xs text-muted">{t('appraisals.columns.customer')}</dt>
                <dd className="mt-0.5 font-medium text-heading">
                  {customerById(customers, selected.customerId)?.name ?? '—'}
                </dd>
              </div>
              <div className="rounded-xl border border-themed p-3">
                <dt className="text-xs text-muted">{t('appraisals.columns.year')}</dt>
                <dd className="mt-0.5 font-medium text-heading">{selected.year}</dd>
              </div>
              <div className="rounded-xl border border-themed p-3">
                <dt className="text-xs text-muted">{t('appraisals.columns.km')}</dt>
                <dd className="mt-0.5 font-medium text-heading">{formatNumber(selected.km, lang)} km</dd>
              </div>
              <div className="rounded-xl border border-themed p-3">
                <dt className="text-xs text-muted">{t('appraisals.columns.condition')}</dt>
                <dd className="mt-1">
                  <ConditionPill condition={selected.condition} />
                </dd>
              </div>
            </dl>

            {selected.options.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-muted">{t('vehicle.options')}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {selected.options.map((opt) => (
                    <li key={opt} className="rounded-full border border-themed px-2.5 py-1 text-xs text-body">
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AppraisalBreakdown appraisal={detail} bare />
          </div>
        )}
      </Drawer>
    </div>
  )
}
