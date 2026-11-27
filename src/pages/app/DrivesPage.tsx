import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { dayKey } from '@/data/mock'
import { customerById, driveConflict, drivesOfDay, sellerById, vehicleById, vehicleLabel } from '@/data/query'
import { formatDate } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import IconBase from '@/components/ui/IconBase'
import Avatar from '@/components/ui/Avatar'
import { DriveStatusPill } from '@/components/dl/StockPill'
import type { TestDrive } from '@/data/types'

const RANGE = 14

export default function DrivesPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('drives.title'))

  const drives = useDealerStore((s) => s.drives)
  const vehicles = useDealerStore((s) => s.vehicles)
  const customers = useDealerStore((s) => s.customers)
  const sellers = useDealerStore((s) => s.sellers)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const setDriveStatus = useDealerStore((s) => s.setDriveStatus)
  const notify = useUiStore((s) => s.notifySuccess)

  const [offset, setOffset] = useState(0)
  const date = dayKey(offset)

  const days = useMemo(() => Array.from({ length: RANGE }, (_, i) => i - 3), [])
  const rows = useMemo(() => drivesOfDay(drives, date), [drives, date])

  /** Os choques do dia, apontados separadamente para veículo e vendedor. */
  const conflicts = useMemo(() => {
    const map = new Map<number, { vehicle?: TestDrive; seller?: TestDrive }>()
    for (const drive of rows) {
      const clash = driveConflict(drive, drives)
      if (clash.vehicle || clash.seller) map.set(drive.id, clash)
    }
    return map
  }, [rows, drives])

  const dayCount = (o: number) => drivesOfDay(drives, dayKey(o)).length

  return (
    <div>
      <PageHeader
        title={t('drives.title')}
        subtitle={t('drives.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('drives.title') }]}
        action={
          conflicts.size > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-lg bg-error-50 px-4 py-2.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
              <IconBase name="alert-triangle" size={16} />
              {t('drives.conflictsCount', { count: conflicts.size })}
            </span>
          ) : undefined
        }
      />

      {/* ---- Régua de dias ---- */}
      <div className="surface-card no-scrollbar mb-5 flex gap-2 overflow-x-auto rounded-2xl border p-3">
        {days.map((o) => {
          const count = dayCount(o)
          return (
            <button
              key={o}
              type="button"
              onClick={() => setOffset(o)}
              className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-center transition ${
                offset === o ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body hover:border-brand-300'
              }`}
            >
              <span className="block text-[11px] opacity-80">
                {o === 0 ? t('common.today') : o === 1 ? t('common.tomorrow') : ''}
              </span>
              <span className="block text-sm font-semibold">{formatDate(`${dayKey(o)}T12:00:00`, lang)}</span>
              <span className="block text-[11px] opacity-80">{count}</span>
            </button>
          )
        })}
      </div>

      {rows.length ? (
        <div className="surface-card overflow-hidden rounded-2xl border">
          <ul className="divide-y divide-themed">
            {rows.map((drive) => {
              const vehicle = vehicleById(vehicles, drive.vehicleId)
              const seller = sellerById(sellers, drive.sellerId)
              const customer = customerById(customers, drive.customerId)
              const clash = conflicts.get(drive.id)

              return (
                <li key={drive.id} className={`p-4 ${clash ? 'bg-error-50/60 dark:bg-error-500/5' : ''}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-24 shrink-0 text-sm font-semibold text-heading">
                      {drive.from}–{drive.to}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-heading">
                        {vehicle ? (
                          <Link to={`/app/veiculo/${vehicle.id}`} className="hover:text-brand-600">
                            {vehicleLabel(models, brands, vehicle)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">{customer?.name ?? '—'}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Avatar src={seller?.avatar} name={seller?.name} size="xs" />
                      <span className="hidden text-xs text-muted sm:block">{seller?.name ?? '—'}</span>
                    </div>

                    {!drive.cnhOk && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-[11px] font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                        <IconBase name="ban" size={11} />
                        {t('drives.cnhMissing')}
                      </span>
                    )}

                    <DriveStatusPill status={drive.status} />

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title={t('drives.markDone')}
                        onClick={() => {
                          setDriveStatus(drive.id, 'realizado')
                          notify(t('drives.updated'))
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted hover:text-success-600"
                      >
                        <IconBase name="check" size={15} />
                      </button>
                      <button
                        type="button"
                        title={t('drives.markNoShow')}
                        onClick={() => {
                          setDriveStatus(drive.id, 'faltou')
                          notify(t('drives.updated'))
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted hover:text-warning-600"
                      >
                        <IconBase name="user" size={15} />
                      </button>
                      <button
                        type="button"
                        title={t('drives.cancelDrive')}
                        onClick={() => {
                          setDriveStatus(drive.id, 'cancelado')
                          notify(t('drives.updated'))
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted hover:text-error-600"
                      >
                        <IconBase name="x" size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Os dois conflitos aparecem separados: veículo e vendedor. */}
                  {clash && (
                    <div className="mt-3 flex flex-wrap gap-2 pl-0 sm:pl-24">
                      {clash.vehicle && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                          <IconBase name="car" size={12} />
                          {t('drives.conflictVehicle')} · {clash.vehicle.from}–{clash.vehicle.to}
                        </span>
                      )}
                      {clash.seller && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-700 dark:bg-warning-500/15 dark:text-warning-500">
                          <IconBase name="user" size={12} />
                          {t('drives.conflictSeller')} ·{' '}
                          {sellerById(sellers, clash.seller.sellerId)?.name ?? '—'}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="surface-card rounded-2xl border">
          <EmptyState icon="calendar" title={t('drives.empty')} description={t('drives.emptyDesc')} />
        </div>
      )}
    </div>
  )
}
