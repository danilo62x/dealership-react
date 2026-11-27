import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { minDown, simulate } from '@/data/query'
import { formatCurrency, formatPercent } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import FinanceMemo from './FinanceMemo'
import type { Simulation } from '@/data/types'

const TERMS = [24, 36, 48, 60]

interface Props {
  price: number
  /** Valor da troca já aprovada — abate a entrada do carro novo. */
  tradeIn?: number
  /** Mostra a memória do cálculo embaixo dos números. */
  showMemo?: boolean
  /** Mostra a comparação dos quatro prazos lado a lado. */
  showCompare?: boolean
  onChange?: (simulation: Simulation) => void
}

/**
 * Simulador ao vivo. Mexer na entrada, no prazo ou na taxa recalcula na hora,
 * e a entrada nunca desce da mínima do estoque — a tela diz por quê.
 */
export default function FinanceSimulator({ price, tradeIn = 0, showMemo = true, showCompare = false, onChange }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const rules = useDealerStore((s) => s.rules)

  const floor = minDown(price, rules)
  const [down, setDown] = useState(floor)
  const [months, setMonths] = useState(48)
  const [rate, setRate] = useState(rules.defaultMonthlyRate)

  // O preço muda quando o visitante troca de veículo: a entrada volta ao piso.
  useEffect(() => {
    setDown(minDown(price, rules))
  }, [price, rules])

  const effectiveDown = Math.max(floor, Math.min(down, price))
  const belowFloor = down < floor

  const simulation = useMemo(
    () => simulate({ price, down: effectiveDown, months, rate, tradeIn }, rules),
    [price, effectiveDown, months, rate, tradeIn, rules]
  )

  useEffect(() => {
    onChange?.(simulation)
  }, [simulation, onChange])

  const comparison = useMemo(
    () => TERMS.map((n) => ({ months: n, sim: simulate({ price, down: effectiveDown, months: n, rate, tradeIn }, rules) })),
    [price, effectiveDown, rate, tradeIn, rules]
  )
  const cheapest = comparison.reduce((best, row) => (row.sim.total < best.sim.total ? row : best), comparison[0])

  const control =
    'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm font-medium text-body'

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-2xl border p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-heading" htmlFor="sim-down">
                {t('finance.down')}
                <span className="text-xs font-normal text-muted">{t('finance.minDown', { value: formatCurrency(floor, lang) })}</span>
              </label>
              <input
                id="sim-down"
                type="number"
                min={floor}
                max={price}
                step={500}
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className={control}
              />
              <input
                type="range"
                min={floor}
                max={price}
                step={500}
                value={effectiveDown}
                onChange={(e) => setDown(Number(e.target.value))}
                className="mt-2 w-full"
                aria-label={t('finance.down')}
              />
              {belowFloor && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-warning-600 dark:text-warning-500">
                  <IconBase name="alert-triangle" size={14} className="mt-0.5" />
                  {t('finance.minDownHint', { pct: formatPercent(1 - rules.minDownPct, lang) })}
                </p>
              )}
              {tradeIn > 0 && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-success-600 dark:text-success-500">
                  <IconBase name="check-circle" size={14} className="mt-0.5" />
                  {t('finance.tradeInApplied', { value: formatCurrency(tradeIn, lang) })}
                </p>
              )}
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-heading">{t('finance.months')}</span>
              <div className="flex flex-wrap gap-2">
                {TERMS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMonths(n)}
                    className={`focus-ring rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      months === n
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-themed text-body hover:text-heading'
                    }`}
                  >
                    {t('finance.monthsUnit', { months: n })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="sim-rate">
                {t('finance.rate')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="sim-rate"
                  type="range"
                  min={0.005}
                  max={0.035}
                  step={0.0005}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
                />
                <span className="w-20 shrink-0 text-right text-sm font-semibold text-heading">
                  {(rate * 100).toFixed(2).replace('.', ',')}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-brand-50 p-5 dark:bg-brand-500/10">
            <p className="text-xs uppercase tracking-wider text-muted">{t('finance.installment')}</p>
            <p className="mt-1 text-title-sm font-bold text-brand-600 dark:text-brand-400">
              {formatCurrency(simulation.installment, lang)}
              <span className="text-base font-medium text-muted">{t('common.perMonth')}</span>
            </p>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('finance.financed')}</dt>
                <dd className="font-medium text-heading">{formatCurrency(simulation.financed, lang)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('finance.total')}</dt>
                <dd className="font-medium text-heading">{formatCurrency(simulation.total, lang)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('finance.interest')}</dt>
                <dd className="font-medium text-heading">{formatCurrency(simulation.interest, lang)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
                <dt className="text-muted">{t('finance.cet')}</dt>
                <dd className="font-bold text-heading">{(simulation.cet * 100).toFixed(2).replace('.', ',')}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {showCompare && (
        <div className="surface-card rounded-2xl border p-5 md:p-6">
          <h3 className="font-semibold text-heading">{t('finance.compare.title')}</h3>
          <p className="mt-1 text-xs text-muted">{t('finance.compare.subtitle')}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {comparison.map((row) => (
              <button
                key={row.months}
                type="button"
                onClick={() => setMonths(row.months)}
                className={`rounded-xl border p-4 text-left transition ${
                  months === row.months ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed hover:border-brand-300'
                }`}
              >
                <p className="text-xs font-medium text-muted">{t('finance.monthsUnit', { months: row.months })}</p>
                <p className="mt-1 text-lg font-bold text-heading">{formatCurrency(row.sim.installment, lang)}</p>
                <p className="mt-1 text-xs text-muted">
                  {t('finance.total')}: {formatCurrency(row.sim.total, lang)}
                </p>
                <p className="text-xs text-muted">
                  {t('finance.cet')}: {(row.sim.cet * 100).toFixed(2).replace('.', ',')}%
                </p>
                {row.months === cheapest.months && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-500/15 dark:text-success-500">
                    <IconBase name="check" size={11} strokeWidth={2.5} />
                    {t('finance.compare.cheapest')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {showMemo && <FinanceMemo simulation={simulation} />}
    </div>
  )
}
