import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { availableStock, minDown, vehicleLabel } from '@/data/query'
import { formatCurrency, formatPercent } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import FinanceSimulator from '@/components/dl/FinanceSimulator'

const FREE_VALUE = -1

export default function FinancePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('finance.title'))

  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const rules = useDealerStore((s) => s.rules)

  const showcase = useMemo(() => availableStock(vehicles).slice(0, 40), [vehicles])
  const [vehicleId, setVehicleId] = useState<number>(showcase[0]?.id ?? FREE_VALUE)
  const [freePrice, setFreePrice] = useState(90000)

  const selected = showcase.find((v) => v.id === vehicleId)
  const price = selected ? selected.price : freePrice

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-title-sm font-bold text-heading">{t('finance.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t('finance.subtitle')}</p>
      </header>

      <div className="surface-card mb-5 rounded-2xl border p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="fin-vehicle">
              {t('finance.pickVehicle')}
            </label>
            <select
              id="fin-vehicle"
              value={vehicleId}
              onChange={(e) => setVehicleId(Number(e.target.value))}
              className={control}
            >
              <option value={FREE_VALUE}>{t('finance.freeValue')}</option>
              {showcase.map((v) => (
                <option key={v.id} value={v.id}>
                  {vehicleLabel(models, brands, v)} · {v.modelYear} · {formatCurrency(v.price, lang)}
                </option>
              ))}
            </select>
            {selected && (
              <p className="mt-1.5 text-xs text-muted">
                {t('finance.ofVehicle', { name: vehicleLabel(models, brands, selected) })}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="fin-price">
              {t('finance.price')}
            </label>
            <input
              id="fin-price"
              type="number"
              min={10000}
              step={1000}
              value={price}
              disabled={Boolean(selected)}
              onChange={(e) => setFreePrice(Math.max(10000, Number(e.target.value)))}
              className={`${control} disabled:opacity-60`}
            />
            <p className="mt-1.5 text-xs text-muted">
              {t('finance.minDown', { value: formatCurrency(minDown(price, rules), lang) })} ·{' '}
              {t('finance.rate')} {formatPercent(rules.defaultMonthlyRate, lang)}
            </p>
          </div>
        </div>
      </div>

      <FinanceSimulator price={price} showMemo showCompare />

      <section className="surface-card mt-5 rounded-2xl border p-5 md:p-6">
        <h2 className="flex items-center gap-2 font-semibold text-heading">
          <IconBase name="info" size={18} className="text-brand-500" />
          {t('finance.cet')}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">{t('finance.cetHint')}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-themed p-3.5">
            <dt className="text-xs text-muted">{t('finance.fee')}</dt>
            <dd className="mt-1 text-sm font-semibold text-heading">{formatCurrency(rules.registrationFee, lang)}</dd>
          </div>
          <div className="rounded-xl border border-themed p-3.5">
            <dt className="text-xs text-muted">{t('finance.iof')}</dt>
            <dd className="mt-1 text-sm font-semibold text-heading">{formatPercent(rules.iocPct, lang)}</dd>
          </div>
          <div className="rounded-xl border border-themed p-3.5">
            <dt className="text-xs text-muted">{t('settings.rules.minDownPct')}</dt>
            <dd className="mt-1 text-sm font-semibold text-heading">{formatPercent(rules.minDownPct, lang)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
