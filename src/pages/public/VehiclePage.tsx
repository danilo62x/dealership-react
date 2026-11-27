import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/hooks/useNow'
import { daysInStock, similarVehicles, vehicleBySlug, vehicleLabel, yearLabel } from '@/data/query'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import EmptyState from '@/components/ui/EmptyState'
import Breadcrumb from '@/components/ui/Breadcrumb'
import VehicleGallery from '@/components/dl/VehicleGallery'
import SpecGrid from '@/components/dl/SpecGrid'
import FinanceSimulator from '@/components/dl/FinanceSimulator'
import FuelBadge from '@/components/dl/FuelBadge'
import StockPill from '@/components/dl/StockPill'
import VehicleCard from '@/components/dl/VehicleCard'

export default function VehiclePage() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const now = useNow()

  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const notify = useUiStore((s) => s.notifySuccess)

  const vehicle = useMemo(() => vehicleBySlug(vehicles, slug), [vehicles, slug])
  const label = vehicle ? vehicleLabel(models, brands, vehicle) : t('vehicle.notFound')
  usePageTitle(label)

  const similar = useMemo(
    () => (vehicle ? similarVehicles(vehicles, models, vehicle, 4) : []),
    [vehicles, models, vehicle]
  )

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="surface-card rounded-2xl border">
          <EmptyState
            icon="car"
            title={t('vehicle.notFound')}
            description={t('vehicle.notFoundDesc')}
            action={
              <Link
                to="/estoque"
                className="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                {t('nav.stock')}
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const days = daysInStock(vehicle, now)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: t('nav.home'), href: '/', icon: 'home' },
          { label: t('nav.stock'), href: '/estoque' },
          { label },
        ]}
      />

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <VehicleGallery seeds={vehicle.photoSeeds} alt={label} />

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-heading">{t('vehicle.specs')}</h2>
            <div className="mt-3">
              <SpecGrid vehicle={vehicle} />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-heading">{t('vehicle.options')}</h2>
            {vehicle.options.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {vehicle.options.map((opt) => (
                  <li
                    key={opt}
                    className="inline-flex items-center gap-1.5 rounded-full border border-themed px-3 py-1.5 text-xs font-medium text-body"
                  >
                    <IconBase name="check" size={12} strokeWidth={2.5} className="text-success-500" />
                    {opt}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">{t('vehicle.noOptions')}</p>
            )}
          </div>
        </div>

        {/* ---- Coluna de compra ---- */}
        <aside className="min-w-0 space-y-5">
          <div className="surface-card rounded-2xl border p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StockPill state={vehicle.state} />
              <FuelBadge fuel={vehicle.fuel} />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-heading">{label}</h1>
            <p className="mt-1 text-sm text-muted">
              {yearLabel(vehicle)} · {formatNumber(vehicle.km, lang)} km · {vehicle.color}
            </p>

            <p className="mt-5 text-title-sm font-bold text-brand-600 dark:text-brand-400">
              {formatCurrency(vehicle.price, lang)}
            </p>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2">
                <dt className="text-muted">{t('vehicle.arrived')}</dt>
                <dd className="font-medium text-heading">{formatDate(vehicle.arrivedAt, lang)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-themed pt-2">
                <dt className="text-muted">{t('vehicle.daysInStock')}</dt>
                <dd className="font-medium text-heading">{t('common.daysCount', { count: days })}</dd>
              </div>
            </dl>

            {vehicle.state === 'preparacao' && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-500">
                <IconBase name="alert-triangle" size={14} className="mt-0.5" />
                {t('vehicle.inPrep')}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/test-drive"
                state={{ vehicleId: vehicle.id }}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                <IconBase name="steering" size={16} />
                {t('vehicle.scheduleDrive')}
              </Link>
              <button
                type="button"
                onClick={() => notify(t('vehicle.offerSent'))}
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <IconBase name="handshake" size={16} />
                {t('vehicle.makeOffer')}
              </button>
            </div>
          </div>

          {/* ---- Simulador embutido ---- */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-heading">
              <IconBase name="calculator" size={18} className="text-brand-500" />
              {t('vehicle.simulate')}
            </h2>
            <FinanceSimulator price={vehicle.price} showMemo />
          </div>
        </aside>
      </div>

      {/* ---- Parecidos ---- */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-title-sm font-bold text-heading">{t('vehicle.similar')}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={v} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
