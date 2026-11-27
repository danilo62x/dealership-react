import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { dlImage, STORE } from '@/data/mock'
import { availableStock, countByCategory, freshArrivals, weeklyHighlights } from '@/data/query'
import { formatCurrency, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import EmptyState from '@/components/ui/EmptyState'
import VehicleCard from '@/components/dl/VehicleCard'
import type { ModelCategory } from '@/data/types'

const CATEGORIES: { key: ModelCategory; icon: string }[] = [
  { key: 'hatch', icon: 'car' },
  { key: 'sedan', icon: 'car' },
  { key: 'suv', icon: 'truck' },
  { key: 'picape', icon: 'truck' },
  { key: 'utilitario', icon: 'package' },
]

const WHY = [
  { key: 'a', icon: 'calculator' },
  { key: 'b', icon: 'refresh-cw' },
  { key: 'c', icon: 'calendar' },
]

const PRICE_STEPS = [60000, 90000, 130000, 200000]

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle()
  const navigate = useNavigate()

  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)

  const showcase = useMemo(() => availableStock(vehicles), [vehicles])
  const highlights = useMemo(() => weeklyHighlights(vehicles, 4), [vehicles])
  const arrivals = useMemo(() => freshArrivals(vehicles, 8), [vehicles])
  const cheapest = useMemo(
    () => showcase.reduce((min, v) => (v.price < min ? v.price : min), showcase[0]?.price ?? 0),
    [showcase]
  )

  const [brandId, setBrandId] = useState('')
  const [category, setCategory] = useState('')
  const [priceMax, setPriceMax] = useState('')

  const search = () => {
    const params = new URLSearchParams()
    if (brandId) params.set('marca', brandId)
    if (category) params.set('segmento', category)
    if (priceMax) params.set('preco', priceMax)
    navigate(`/estoque?${params.toString()}`)
  }

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  return (
    <div>
      {/* ---- Vitrine em destaque ---- */}
      <section className="relative isolate overflow-hidden border-b border-themed">
        <img
          src={dlImage(STORE.coverSeed, 1600, 900)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <IconBase name="shield-check" size={13} />
                {t('home.hero.eyebrow')}
              </p>
              <h1 className="mt-5 text-3xl font-bold text-white sm:text-title-md lg:text-title-lg">
                {t('home.hero.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/80">{t('home.hero.subtitle')}</p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <IconBase name="car" size={15} />
                  {formatNumber(showcase.length, lang)} {t('home.hero.available')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconBase name="tag" size={15} />
                  {formatNumber(brands.length, lang)} {t('home.hero.brands')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconBase name="dollar" size={15} />
                  {t('home.hero.fromPrice')} {formatCurrency(cheapest, lang)}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/estoque"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
                >
                  <IconBase name="car" size={16} />
                  {t('home.hero.cta')}
                </Link>
                <Link
                  to="/financiamento"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 px-5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {t('home.hero.secondary')}
                </Link>
              </div>
            </div>

            {/* ---- Busca rápida ---- */}
            <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/60">{t('home.quick.title')}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70" htmlFor="q-brand">
                    {t('home.quick.brand')}
                  </label>
                  <select
                    id="q-brand"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className={`${control} border-white/20 text-white`}
                  >
                    <option value="" className="text-gray-900">
                      {t('home.quick.anyBrand')}
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id} className="text-gray-900">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/70" htmlFor="q-cat">
                    {t('home.quick.category')}
                  </label>
                  <select
                    id="q-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${control} border-white/20 text-white`}
                  >
                    <option value="" className="text-gray-900">
                      {t('home.quick.anyCategory')}
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key} className="text-gray-900">
                        {t(`spec.category.${c.key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/70" htmlFor="q-price">
                    {t('home.quick.priceMax')}
                  </label>
                  <select
                    id="q-price"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className={`${control} border-white/20 text-white`}
                  >
                    <option value="" className="text-gray-900">
                      {t('home.quick.anyPrice')}
                    </option>
                    {PRICE_STEPS.map((p) => (
                      <option key={p} value={p} className="text-gray-900">
                        {formatCurrency(p, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={search}
                  className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
                >
                  <IconBase name="search" size={16} />
                  {t('home.quick.cta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Destaques da semana ---- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-title-sm font-bold text-heading">{t('home.highlights.title')}</h2>
            <p className="mt-1 text-sm text-muted">{t('home.highlights.subtitle')}</p>
          </div>
          <Link to="/estoque" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">
            {t('common.viewAll')}
            <IconBase name="arrow-right" size={15} />
          </Link>
        </div>

        {highlights.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="surface-card mt-6 rounded-2xl border">
            <EmptyState icon="car" title={t('stock.empty')} description={t('stock.emptyDesc')} />
          </div>
        )}
      </section>

      {/* ---- Chegou agora ---- */}
      <section className="border-y border-themed bg-gray-50 py-14 dark:bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-title-sm font-bold text-heading">{t('home.arrivals.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('home.arrivals.subtitle')}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {arrivals.slice(0, 4).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} compact />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Por categoria ---- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-title-sm font-bold text-heading">{t('home.categories.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('home.categories.subtitle')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.key}
              to={`/estoque?segmento=${category.key}`}
              className="surface-card group flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-theme-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/15">
                <IconBase name={category.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-heading">{t(`spec.category.${category.key}`)}</span>
                <span className="block text-xs text-muted">
                  {t('common.vehiclesCount', { count: countByCategory(showcase, models, category.key) })}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Por que comprar aqui ---- */}
      <section className="border-t border-themed bg-gray-50 py-14 dark:bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-title-sm font-bold text-heading">{t('home.why.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('home.why.subtitle')}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {WHY.map((item) => (
              <div key={item.key} className="surface-card rounded-2xl border p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                  <IconBase name={item.icon} size={20} />
                </span>
                <h3 className="mt-4 font-semibold text-heading">{t(`home.why.${item.key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-muted">{t(`home.why.${item.key}.text`)}</p>
              </div>
            ))}
          </div>

          {/* ---- Chamada da troca ---- */}
          <div className="surface-card mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center md:p-8">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-heading">{t('home.sell.title')}</h3>
              <p className="mt-1 max-w-xl text-sm text-muted">{t('home.sell.text')}</p>
            </div>
            <Link
              to="/vender-meu-carro"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <IconBase name="calculator" size={16} />
              {t('home.sell.cta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
