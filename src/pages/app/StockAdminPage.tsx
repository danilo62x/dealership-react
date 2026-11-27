import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { type ColumnDef } from '@tanstack/react-table'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/hooks/useNow'
import { OPTION_CATALOG } from '@/data/mock'
import {
  brandById,
  daysInStock,
  filterStock,
  margin,
  marginPct,
  slowMovers,
  vehicleLabel,
  yearLabel,
} from '@/data/query'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FilterBar, { FilterSelect } from '@/components/ui/FilterBar'
import ModalBase from '@/components/ui/ModalBase'
import IconBase from '@/components/ui/IconBase'
import EmptyState from '@/components/ui/EmptyState'
import StockPill from '@/components/dl/StockPill'
import type { Fuel, StockState, Transmission, Vehicle } from '@/data/types'

const STATES: StockState[] = ['disponivel', 'reservado', 'vendido', 'preparacao']
const TRANSMISSIONS: Transmission[] = ['manual', 'automatico', 'cvt', 'automatizado']
const FUELS: Fuel[] = ['flex', 'gasolina', 'diesel', 'hibrido', 'eletrico']

interface FormState {
  modelId: number
  version: string
  year: number
  modelYear: number
  km: number
  color: string
  plateEnd: string
  transmission: Transmission
  fuel: Fuel
  doors: number
  acquisitionCost: number
  prepCost: number
  price: number
  state: StockState
  options: string[]
}

export default function StockAdminPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('stockAdmin.title'))
  const now = useNow()

  const [params, setParams] = useSearchParams()
  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const rules = useDealerStore((s) => s.rules)
  const saveVehicle = useDealerStore((s) => s.saveVehicle)
  const notify = useUiStore((s) => s.notifySuccess)

  const [term, setTerm] = useState('')
  const [state, setState] = useState('')
  const [onlySlow, setOnlySlow] = useState(params.get('giro') === 'lento')
  const [open, setOpen] = useState(params.get('novo') === '1')

  const [form, setForm] = useState<FormState>({
    modelId: models[0]?.id ?? 1,
    version: '1.0 Turbo',
    year: new Date(now).getFullYear() - 2,
    modelYear: new Date(now).getFullYear() - 1,
    km: 24000,
    color: 'Branco',
    plateEnd: '7',
    transmission: 'automatico',
    fuel: 'flex',
    doors: 4,
    acquisitionCost: 62000,
    prepCost: 2400,
    price: 74900,
    state: 'preparacao',
    options: ['Ar-condicionado', 'Central multimídia'],
  })

  const slowIds = useMemo(
    () => new Set(slowMovers(vehicles, now, rules).map((row) => row.vehicle.id)),
    [vehicles, now, rules]
  )

  const rows = useMemo(() => {
    let list = filterStock(vehicles, models, brands, { term })
    if (state) list = list.filter((v) => v.state === state)
    if (onlySlow) list = list.filter((v) => slowIds.has(v.id))
    return [...list].sort((a, b) => daysInStock(b, now) - daysInStock(a, now))
  }, [vehicles, models, brands, term, state, onlySlow, slowIds, now])

  const columns = useMemo<ColumnDef<Vehicle, unknown>[]>(
    () => [
      {
        id: 'vehicle',
        header: t('stockAdmin.columns.vehicle'),
        cell: ({ row }) => (
          <Link to={`/app/veiculo/${row.original.id}`} className="font-medium text-heading hover:text-brand-600">
            {vehicleLabel(models, brands, row.original)}
          </Link>
        ),
      },
      { id: 'year', header: t('stockAdmin.columns.year'), cell: ({ row }) => yearLabel(row.original) },
      {
        id: 'km',
        header: t('stockAdmin.columns.km'),
        cell: ({ row }) => `${formatNumber(row.original.km, lang)} km`,
      },
      {
        id: 'cost',
        header: t('stockAdmin.columns.cost'),
        cell: ({ row }) => formatCurrency(row.original.acquisitionCost + row.original.prepCost, lang),
      },
      {
        id: 'price',
        header: t('stockAdmin.columns.price'),
        cell: ({ row }) => <span className="font-medium text-heading">{formatCurrency(row.original.price, lang)}</span>,
      },
      {
        id: 'margin',
        header: t('stockAdmin.columns.margin'),
        cell: ({ row }) => {
          const value = margin(row.original, row.original.price)
          return (
            <span className={value < 0 ? 'font-medium text-error-600 dark:text-error-500' : 'font-medium text-success-600 dark:text-success-500'}>
              {formatCurrency(value, lang)}
              <span className="ml-1 text-xs font-normal text-muted">
                {formatPercent(marginPct(row.original, row.original.price), lang)}
              </span>
            </span>
          )
        },
      },
      {
        id: 'days',
        header: t('stockAdmin.columns.days'),
        cell: ({ row }) => {
          const days = daysInStock(row.original, now)
          const slow = slowIds.has(row.original.id)
          return (
            <span className={slow ? 'font-semibold text-warning-600 dark:text-warning-500' : ''}>
              {t('common.daysCount', { count: days })}
            </span>
          )
        },
      },
      {
        id: 'state',
        header: t('stockAdmin.columns.state'),
        cell: ({ row }) => <StockPill state={row.original.state} />,
      },
    ],
    [t, lang, models, brands, now, slowIds]
  )

  const formMargin = form.price - form.acquisitionCost - form.prepCost
  const formMarginPct = form.price > 0 ? formMargin / form.price : 0

  const submit = () => {
    saveVehicle(form)
    setOpen(false)
    setParams({})
    notify(t('stockAdmin.saved'))
  }

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div>
      <PageHeader
        title={t('stockAdmin.title')}
        subtitle={t('stockAdmin.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('stockAdmin.title') }]}
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <IconBase name="plus" size={16} />
            {t('stockAdmin.new')}
          </button>
        }
      />

      <FilterBar search={term} onSearch={setTerm} searchPlaceholder={t('stockAdmin.searchPlaceholder')}>
        <FilterSelect value={state} onChange={setState} label={t('common.status')}>
          <option value="">{t('common.all')}</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {t(`status.stock.${s}`)}
            </option>
          ))}
        </FilterSelect>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={onlySlow}
            onChange={(e) => setOnlySlow(e.target.checked)}
            className="h-4 w-4 rounded border-themed accent-brand-500"
          />
          {t('stockAdmin.onlySlow')}
        </label>
      </FilterBar>

      {rows.length ? (
        <DataTable columns={columns} data={rows} pageSize={12} searchable={false} />
      ) : (
        <div className="surface-card rounded-2xl border">
          <EmptyState icon="car" title={t('stockAdmin.empty')} description={t('stockAdmin.emptyDesc')} />
        </div>
      )}

      <ModalBase
        open={open}
        onClose={() => setOpen(false)}
        title={t('stockAdmin.form.title')}
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={submit}
              className="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              {t('common.save')}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-model">
              {t('stockAdmin.form.model')}
            </label>
            <select id="v-model" value={form.modelId} onChange={(e) => set('modelId', Number(e.target.value))} className={control}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {brandById(brands, m.brandId)?.name} {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-version">
              {t('stockAdmin.form.version')}
            </label>
            <input id="v-version" value={form.version} onChange={(e) => set('version', e.target.value)} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-color">
              {t('stockAdmin.form.color')}
            </label>
            <input id="v-color" value={form.color} onChange={(e) => set('color', e.target.value)} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-year">
              {t('stockAdmin.form.year')}
            </label>
            <input id="v-year" type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-myear">
              {t('stockAdmin.form.modelYear')}
            </label>
            <input id="v-myear" type="number" value={form.modelYear} onChange={(e) => set('modelYear', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-km">
              {t('stockAdmin.form.km')}
            </label>
            <input id="v-km" type="number" value={form.km} onChange={(e) => set('km', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-tr">
              {t('stockAdmin.form.transmission')}
            </label>
            <select id="v-tr" value={form.transmission} onChange={(e) => set('transmission', e.target.value as Transmission)} className={control}>
              {TRANSMISSIONS.map((tr) => (
                <option key={tr} value={tr}>
                  {t(`spec.transmission.${tr}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-fuel">
              {t('stockAdmin.form.fuel')}
            </label>
            <select id="v-fuel" value={form.fuel} onChange={(e) => set('fuel', e.target.value as Fuel)} className={control}>
              {FUELS.map((f) => (
                <option key={f} value={f}>
                  {t(`spec.fuel.${f}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-doors">
              {t('stockAdmin.form.doors')}
            </label>
            <input id="v-doors" type="number" min={2} max={5} value={form.doors} onChange={(e) => set('doors', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-plate">
              {t('stockAdmin.form.plateEnd')}
            </label>
            <input id="v-plate" value={form.plateEnd} onChange={(e) => set('plateEnd', e.target.value)} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-acq">
              {t('stockAdmin.form.acquisitionCost')}
            </label>
            <input id="v-acq" type="number" value={form.acquisitionCost} onChange={(e) => set('acquisitionCost', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-prep">
              {t('stockAdmin.form.prepCost')}
            </label>
            <input id="v-prep" type="number" value={form.prepCost} onChange={(e) => set('prepCost', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-price">
              {t('stockAdmin.form.price')}
            </label>
            <input id="v-price" type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} className={control} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="v-state">
              {t('stockAdmin.form.state')}
            </label>
            <select id="v-state" value={form.state} onChange={(e) => set('state', e.target.value as StockState)} className={control}>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.stock.${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-sm font-medium text-heading">{t('vehicle.options')}</span>
          <div className="flex flex-wrap gap-2">
            {OPTION_CATALOG.map((opt) => {
              const active = form.options.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    set('options', active ? form.options.filter((o) => o !== opt) : [...form.options, opt])
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'border-themed text-muted hover:text-body'
                  }`}
                >
                  {active && <IconBase name="check" size={12} strokeWidth={2.5} />}
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        <p
          className={`mt-4 rounded-xl border p-3.5 text-sm ${
            formMargin < 0
              ? 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500'
              : 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-500'
          }`}
        >
          {t('stockAdmin.form.marginPreview', {
            value: formatCurrency(formMargin, lang),
            pct: formatPercent(formMarginPct, lang),
          })}
        </p>
      </ModalBase>
    </div>
  )
}
