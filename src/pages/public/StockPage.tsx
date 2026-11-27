import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { availableStock, filterStock, sortStock } from '@/data/query'
import { formatCurrency, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import VehicleCard from '@/components/dl/VehicleCard'
import FuelBadge from '@/components/dl/FuelBadge'
import type { Fuel, ModelCategory, StockSort, Transmission } from '@/data/types'

const PAGE_SIZE = 12
const CATEGORIES: ModelCategory[] = ['hatch', 'sedan', 'suv', 'picape', 'utilitario']
const TRANSMISSIONS: Transmission[] = ['manual', 'automatico', 'cvt', 'automatizado']
const FUELS: Fuel[] = ['flex', 'gasolina', 'diesel', 'hibrido', 'eletrico']
const PRICE_STEPS = [50000, 80000, 110000, 150000, 220000]
const KM_STEPS = [20000, 50000, 80000, 120000]

const SORTS: { value: StockSort; key: string }[] = [
  { value: 'recent', key: 'stock.sort.recent' },
  { value: 'price-asc', key: 'stock.sort.priceAsc' },
  { value: 'price-desc', key: 'stock.sort.priceDesc' },
  { value: 'km-asc', key: 'stock.sort.kmAsc' },
  { value: 'year-desc', key: 'stock.sort.yearDesc' },
]

export default function StockPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('stock.title'))

  const [params, setParams] = useSearchParams()
  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const stockView = useUiStore((s) => s.stockView)
  const setStockView = useUiStore((s) => s.setStockView)

  const [term, setTerm] = useState('')
  const [brandId, setBrandId] = useState(params.get('marca') ?? '')
  const [category, setCategory] = useState(params.get('segmento') ?? '')
  const [transmission, setTransmission] = useState('')
  const [fuel, setFuel] = useState('')
  const [color, setColor] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [priceMax, setPriceMax] = useState(params.get('preco') ?? '')
  const [kmMax, setKmMax] = useState('')
  const [sort, setSort] = useState<StockSort>('recent')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setBrandId(params.get('marca') ?? '')
    setCategory(params.get('segmento') ?? '')
    setPriceMax(params.get('preco') ?? '')
  }, [params])

  const showcase = useMemo(() => availableStock(vehicles), [vehicles])
  const colors = useMemo(() => Array.from(new Set(showcase.map((v) => v.color))).sort(), [showcase])
  const years = useMemo(
    () => Array.from(new Set(showcase.map((v) => v.modelYear))).sort((a, b) => b - a),
    [showcase]
  )
  const brandModels = useMemo(
    () => (brandId ? models.filter((m) => m.brandId === Number(brandId)) : models),
    [models, brandId]
  )

  const filtered = useMemo(
    () =>
      sortStock(
        filterStock(showcase, models, brands, {
          term,
          brandId: brandId ? Number(brandId) : null,
          category,
          transmission,
          fuel,
          color,
          yearMin: yearMin ? Number(yearMin) : null,
          priceMax: priceMax ? Number(priceMax) : null,
          kmMax: kmMax ? Number(kmMax) : null,
        }),
        sort
      ),
    [showcase, models, brands, term, brandId, category, transmission, fuel, color, yearMin, priceMax, kmMax, sort]
  )

  useEffect(() => setPage(1), [term, brandId, category, transmission, fuel, color, yearMin, priceMax, kmMax, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clear = () => {
    setTerm('')
    setBrandId('')
    setCategory('')
    setTransmission('')
    setFuel('')
    setColor('')
    setYearMin('')
    setPriceMax('')
    setKmMax('')
    setParams({})
  }

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body'

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-title-sm font-bold text-heading">{t('stock.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('stock.subtitle')}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ---- Filtros ---- */}
        <aside className="surface-card h-fit rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
              <IconBase name="filter" size={16} />
              {t('common.filters')}
            </h2>
            <button type="button" onClick={clear} className="text-xs font-medium text-brand-500 hover:text-brand-600">
              {t('common.clearFilters')}
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-term">
                {t('common.search')}
              </label>
              <input
                id="f-term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t('stock.searchPlaceholder')}
                className={control}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-brand">
                {t('stock.brand')}
              </label>
              <select id="f-brand" value={brandId} onChange={(e) => setBrandId(e.target.value)} className={control}>
                <option value="">{t('common.all')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-model">
                {t('stock.model')}
              </label>
              <select
                id="f-model"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={control}
                aria-label={t('stock.category')}
              >
                <option value="">{t('common.all')}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`spec.category.${c}`)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted">
                {t('common.vehiclesCount', { count: brandModels.length })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-year">
                  {t('stock.yearMin')}
                </label>
                <select id="f-year" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className={control}>
                  <option value="">{t('common.all')}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-km">
                  {t('stock.kmMax')}
                </label>
                <select id="f-km" value={kmMax} onChange={(e) => setKmMax(e.target.value)} className={control}>
                  <option value="">{t('common.all')}</option>
                  {KM_STEPS.map((k) => (
                    <option key={k} value={k}>
                      {formatNumber(k, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-price">
                {t('stock.priceMax')}
              </label>
              <select id="f-price" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={control}>
                <option value="">{t('common.all')}</option>
                {PRICE_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {formatCurrency(p, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-tr">
                {t('stock.transmission')}
              </label>
              <select id="f-tr" value={transmission} onChange={(e) => setTransmission(e.target.value)} className={control}>
                <option value="">{t('common.all')}</option>
                {TRANSMISSIONS.map((tr) => (
                  <option key={tr} value={tr}>
                    {t(`spec.transmission.${tr}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-muted">{t('stock.fuel')}</span>
              <div className="flex flex-wrap gap-1.5">
                {FUELS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFuel((cur) => (cur === f ? '' : f))}
                    className={`rounded-full transition ${fuel === f ? 'ring-2 ring-brand-500' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <FuelBadge fuel={f} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted" htmlFor="f-color">
                {t('stock.color')}
              </label>
              <select id="f-color" value={color} onChange={(e) => setColor(e.target.value)} className={control}>
                <option value="">{t('common.all')}</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* ---- Resultados ---- */}
        <div className="min-w-0">
          <div className="surface-card mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
            <p className="text-sm text-muted">{t('common.resultsCount', { count: filtered.length })}</p>
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as StockSort)}
                aria-label={t('common.sortBy')}
                className="focus-ring rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t(s.key)}
                  </option>
                ))}
              </select>
              <div className="flex overflow-hidden rounded-lg border border-themed">
                <button
                  type="button"
                  onClick={() => setStockView('grid')}
                  aria-label={t('common.grid')}
                  className={`flex h-9 w-9 items-center justify-center ${stockView === 'grid' ? 'bg-brand-500 text-white' : 'text-muted'}`}
                >
                  <IconBase name="grid" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setStockView('list')}
                  aria-label={t('common.list')}
                  className={`flex h-9 w-9 items-center justify-center ${stockView === 'list' ? 'bg-brand-500 text-white' : 'text-muted'}`}
                >
                  <IconBase name="list" size={16} />
                </button>
              </div>
            </div>
          </div>

          {pageItems.length ? (
            <>
              <div
                className={
                  stockView === 'grid'
                    ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid gap-4 sm:grid-cols-2'
                }
              >
                {pageItems.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} compact={stockView === 'list'} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </>
          ) : (
            <div className="surface-card rounded-2xl border">
              <EmptyState
                icon="car"
                title={t('stock.empty')}
                description={t('stock.emptyDesc')}
                action={
                  <button
                    type="button"
                    onClick={clear}
                    className="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
                  >
                    {t('common.clearFilters')}
                  </button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
