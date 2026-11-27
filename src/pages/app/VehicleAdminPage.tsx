import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/hooks/useNow'
import { dlImage } from '@/data/mock'
import {
  commission,
  commissionRate,
  customerById,
  daysInStock,
  dealPrice,
  dealsOfVehicle,
  drivesOfVehicle,
  margin,
  marginPct,
  sellerById,
  suggestedDiscountPct,
  vehicleById,
  vehicleLabel,
  yearLabel,
} from '@/data/query'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import Tabs from '@/components/ui/Tabs'
import EmptyState from '@/components/ui/EmptyState'
import IconBase from '@/components/ui/IconBase'
import Avatar from '@/components/ui/Avatar'
import SpecGrid from '@/components/dl/SpecGrid'
import StockPill, { DealStagePill, DriveStatusPill } from '@/components/dl/StockPill'
import type { StockState } from '@/data/types'

const STATES: StockState[] = ['disponivel', 'reservado', 'vendido', 'preparacao']

export default function VehicleAdminPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const now = useNow()
  const [tab, setTab] = useState(0)

  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const deals = useDealerStore((s) => s.deals)
  const drives = useDealerStore((s) => s.drives)
  const customers = useDealerStore((s) => s.customers)
  const sellers = useDealerStore((s) => s.sellers)
  const rules = useDealerStore((s) => s.rules)
  const setVehicleState = useDealerStore((s) => s.setVehicleState)
  const saveVehicle = useDealerStore((s) => s.saveVehicle)
  const notify = useUiStore((s) => s.notifySuccess)

  const vehicle = useMemo(() => vehicleById(vehicles, Number(id)), [vehicles, id])
  const label = vehicle ? vehicleLabel(models, brands, vehicle) : t('vehicle.notFound')
  usePageTitle(label)

  const vehicleDeals = useMemo(() => (vehicle ? dealsOfVehicle(deals, vehicle.id) : []), [deals, vehicle])
  const vehicleDrives = useMemo(() => (vehicle ? drivesOfVehicle(drives, vehicle.id) : []), [drives, vehicle])

  if (!vehicle) {
    return (
      <div className="surface-card rounded-2xl border">
        <EmptyState
          icon="car"
          title={t('vehicle.notFound')}
          description={t('vehicle.notFoundDesc')}
          action={
            <Link
              to="/app/estoque"
              className="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white"
            >
              {t('vehicleAdmin.backToList')}
            </Link>
          }
        />
      </div>
    )
  }

  const days = daysInStock(vehicle, now)
  const totalCost = vehicle.acquisitionCost + vehicle.prepCost
  const marginValue = margin(vehicle, vehicle.price)
  const rate = commissionRate(marginValue, rules)
  const suggested = suggestedDiscountPct(days, rules)

  const specTab = (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <img
          src={dlImage(vehicle.photoSeeds[0] ?? vehicle.slug, 520, 360)}
          alt={label}
          className="aspect-[3/2] w-full rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StockPill state={vehicle.state} />
            <span className="text-xs text-muted">
              {yearLabel(vehicle)} · {formatNumber(vehicle.km, lang)} km
            </span>
          </div>
          <p className="mt-3 text-title-sm font-bold text-heading">{formatCurrency(vehicle.price, lang)}</p>
          <p className="mt-1 text-sm text-muted">
            {t('vehicle.arrived')}: {formatDate(vehicle.arrivedAt, lang)} · {t('common.daysCount', { count: days })}
          </p>

          <div className="mt-5">
            <span className="mb-1.5 block text-sm font-medium text-heading">{t('common.status')}</span>
            <div className="flex flex-wrap gap-2">
              {STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setVehicleState(vehicle.id, s)
                    notify(t('vehicleAdmin.saved'))
                  }}
                  className={`focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                    vehicle.state === s ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body'
                  }`}
                >
                  {t(`status.stock.${s}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SpecGrid vehicle={vehicle} />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-heading">{t('vehicle.options')}</h3>
        {vehicle.options.length ? (
          <ul className="flex flex-wrap gap-2">
            {vehicle.options.map((opt) => (
              <li key={opt} className="rounded-full border border-themed px-3 py-1.5 text-xs text-body">
                {opt}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t('vehicle.noOptions')}</p>
        )}
      </div>
    </div>
  )

  const costsTab = (
    <div className="space-y-5">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-themed p-4">
          <dt className="text-xs text-muted">{t('vehicleAdmin.costs.acquisition')}</dt>
          <dd className="mt-1 text-lg font-semibold text-heading">{formatCurrency(vehicle.acquisitionCost, lang)}</dd>
        </div>
        <div className="rounded-xl border border-themed p-4">
          <dt className="text-xs text-muted">{t('vehicleAdmin.costs.prep')}</dt>
          <dd className="mt-1 text-lg font-semibold text-heading">{formatCurrency(vehicle.prepCost, lang)}</dd>
        </div>
        <div className="rounded-xl border border-themed p-4">
          <dt className="text-xs text-muted">{t('vehicleAdmin.costs.totalCost')}</dt>
          <dd className="mt-1 text-lg font-semibold text-heading">{formatCurrency(totalCost, lang)}</dd>
        </div>
        <div className="rounded-xl border border-themed p-4">
          <dt className="text-xs text-muted">{t('vehicleAdmin.costs.price')}</dt>
          <dd className="mt-1 text-lg font-semibold text-heading">{formatCurrency(vehicle.price, lang)}</dd>
        </div>
      </dl>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-themed p-5">
          <h3 className="text-sm font-semibold text-heading">{t('vehicleAdmin.costs.margin')}</h3>
          <p
            className={`mt-2 text-title-sm font-bold ${
              marginValue < 0 ? 'text-error-600 dark:text-error-500' : 'text-success-600 dark:text-success-500'
            }`}
          >
            {formatCurrency(marginValue, lang)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t('vehicleAdmin.costs.marginPct')}: {formatPercent(marginPct(vehicle, vehicle.price), lang)}
          </p>
          <p className="mt-3 font-mono text-xs text-muted">
            {formatCurrency(vehicle.price, lang)} − {formatCurrency(vehicle.acquisitionCost, lang)} −{' '}
            {formatCurrency(vehicle.prepCost, lang)}
          </p>
          {marginValue < 0 && (
            <p className="mt-3 flex items-center gap-2 text-xs text-error-600 dark:text-error-500">
              <IconBase name="alert-triangle" size={14} />
              {t('vehicleAdmin.costs.loss')}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-themed p-5">
          <h3 className="text-sm font-semibold text-heading">{t('vehicleAdmin.costs.commission')}</h3>
          <p className="mt-2 text-title-sm font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(commission(marginValue, rules), lang)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t('vehicleAdmin.costs.commissionHint', { pct: formatPercent(rate, lang) })}
          </p>

          <div className="mt-4 border-t border-themed pt-3">
            <p className="text-xs text-muted">{t('vehicle.daysInStock')}</p>
            <p className="mt-0.5 text-sm font-semibold text-heading">{t('common.daysCount', { count: days })}</p>
            {suggested > 0 && (
              <p className="mt-1 text-xs text-warning-600 dark:text-warning-500">
                {t('dashboard.suggested')}: −{formatPercent(suggested, lang)} ={' '}
                {formatCurrency(Math.round((vehicle.price * (1 - suggested)) / 100) * 100, lang)}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">{t('vehicleAdmin.costs.daysNote')}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-themed p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-acq">
              {t('stockAdmin.form.acquisitionCost')}
            </label>
            <input
              id="c-acq"
              type="number"
              value={vehicle.acquisitionCost}
              onChange={(e) => saveVehicle({ id: vehicle.id, acquisitionCost: Number(e.target.value) })}
              className="focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-prep">
              {t('stockAdmin.form.prepCost')}
            </label>
            <input
              id="c-prep"
              type="number"
              value={vehicle.prepCost}
              onChange={(e) => saveVehicle({ id: vehicle.id, prepCost: Number(e.target.value) })}
              className="focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="c-price">
              {t('stockAdmin.form.price')}
            </label>
            <input
              id="c-price"
              type="number"
              value={vehicle.price}
              onChange={(e) => saveVehicle({ id: vehicle.id, price: Number(e.target.value) })}
              className="focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const dealsTab = vehicleDeals.length ? (
    <ul className="divide-y divide-themed">
      {vehicleDeals.map((deal) => (
        <li key={deal.id} className="flex flex-wrap items-center gap-3 py-3">
          <DealStagePill stage={deal.stage} />
          <Link to={`/app/proposta/${deal.id}`} className="min-w-0 flex-1 text-sm font-medium text-heading hover:text-brand-600">
            {customerById(customers, deal.customerId)?.name ?? '—'}
          </Link>
          <span className="text-xs text-muted">{sellerById(sellers, deal.sellerId)?.name ?? '—'}</span>
          <span className="text-sm font-semibold text-heading">{formatCurrency(dealPrice(deal, vehicle), lang)}</span>
          <span className="text-xs text-muted">{formatDate(deal.movedAt, lang)}</span>
        </li>
      ))}
    </ul>
  ) : (
    <EmptyState icon="handshake" title={t('vehicleAdmin.noDeals')} />
  )

  const drivesTab = vehicleDrives.length ? (
    <ul className="divide-y divide-themed">
      {vehicleDrives.map((drive) => (
        <li key={drive.id} className="flex flex-wrap items-center gap-3 py-3">
          <span className="w-28 shrink-0 text-sm font-medium text-heading">
            {formatDate(`${drive.date}T12:00:00`, lang)}
          </span>
          <span className="w-24 shrink-0 text-sm text-muted">
            {drive.from}–{drive.to}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar src={sellerById(sellers, drive.sellerId)?.avatar} name={sellerById(sellers, drive.sellerId)?.name} size="xs" />
            <span className="truncate text-sm text-body">{customerById(customers, drive.customerId)?.name ?? '—'}</span>
          </div>
          {!drive.cnhOk && (
            <span className="rounded-full bg-error-50 px-2 py-0.5 text-[11px] font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
              {t('drives.cnhMissing')}
            </span>
          )}
          <DriveStatusPill status={drive.status} />
        </li>
      ))}
    </ul>
  ) : (
    <EmptyState icon="steering" title={t('vehicleAdmin.noDrives')} />
  )

  return (
    <div>
      <PageHeader
        title={label}
        subtitle={`${yearLabel(vehicle)} · ${formatNumber(vehicle.km, lang)} km · ${vehicle.color}`}
        crumbs={[
          { label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' },
          { label: t('stockAdmin.title'), href: '/app/estoque' },
          { label },
        ]}
        action={
          <Link
            to="/app/estoque"
            className="focus-ring flex h-11 items-center gap-2 rounded-lg border border-themed px-5 text-sm font-medium text-body"
          >
            <IconBase name="arrow-right" size={16} className="rotate-180" />
            {t('vehicleAdmin.backToList')}
          </Link>
        }
      />

      <div className="surface-card rounded-2xl border p-5 md:p-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { label: t('vehicleAdmin.tabs.spec'), icon: 'file-text', content: specTab },
            { label: t('vehicleAdmin.tabs.costs'), icon: 'dollar', content: costsTab },
            { label: t('vehicleAdmin.tabs.deals'), icon: 'handshake', content: dealsTab },
            { label: t('vehicleAdmin.tabs.drives'), icon: 'steering', content: drivesTab },
          ]}
        />
      </div>
    </div>
  )
}
