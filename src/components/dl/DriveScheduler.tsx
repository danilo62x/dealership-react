import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { dayKey, dlImage } from '@/data/mock'
import { availableStock, driveConflict, customerById, sellerById, vehicleById, vehicleLabel } from '@/data/query'
import { formatDate } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import type { DriveConflict, TestDrive } from '@/data/types'

const SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
const DAYS_AHEAD = 10

const plusHour = (from: string) => `${String(Number(from.slice(0, 2)) + 1).padStart(2, '0')}:${from.slice(3)}`

interface Props {
  initialVehicleId?: number
}

/**
 * Agendamento em três passos. O horário só é aceito quando está livre para o
 * VEÍCULO e para o VENDEDOR — e a recusa diz qual dos dois bateu, separado da
 * recusa por CNH.
 */
export default function DriveScheduler({ initialVehicleId }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const vehicles = useDealerStore((s) => s.vehicles)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const sellers = useDealerStore((s) => s.sellers)
  const customers = useDealerStore((s) => s.customers)
  const drives = useDealerStore((s) => s.drives)
  const scheduleDrive = useDealerStore((s) => s.scheduleDrive)
  const saveCustomer = useDealerStore((s) => s.saveCustomer)
  const notify = useUiStore((s) => s.notify)

  const showcase = useMemo(() => availableStock(vehicles).filter((v) => v.state === 'disponivel'), [vehicles])

  const [step, setStep] = useState(initialVehicleId ? 1 : 0)
  const [vehicleId, setVehicleId] = useState(initialVehicleId ?? showcase[0]?.id ?? 0)
  const [sellerId, setSellerId] = useState(sellers[0]?.id ?? 0)
  const [dayOffset, setDayOffset] = useState(1)
  const [slot, setSlot] = useState('10:00')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cnhUntil, setCnhUntil] = useState('')

  const [conflict, setConflict] = useState<DriveConflict | null>(null)
  const [cnhRefused, setCnhRefused] = useState(false)
  const [booked, setBooked] = useState<TestDrive | null>(null)

  const date = dayKey(dayOffset)
  const days = useMemo(() => Array.from({ length: DAYS_AHEAD }, (_, i) => i), [])

  /** Choques do slot escolhido, calculados ao vivo enquanto o visitante escolhe. */
  const liveClash = useMemo(
    () => driveConflict({ vehicleId, sellerId, customerId: 0, date, from: slot, to: plusHour(slot) }, drives),
    [vehicleId, sellerId, date, slot, drives]
  )

  const slotState = (from: string) =>
    driveConflict({ vehicleId, sellerId, customerId: 0, date, from, to: plusHour(from) }, drives)

  const vehicle = vehicleById(vehicles, vehicleId)

  const submit = () => {
    setConflict(null)
    setCnhRefused(false)

    const customer = saveCustomer({
      name: name || 'Visitante',
      email,
      phone,
      cnhUntil: cnhUntil ? new Date(`${cnhUntil}T12:00:00`).toISOString() : null,
    })

    const result = scheduleDrive({
      vehicleId,
      customerId: customer.id,
      sellerId,
      date,
      from: slot,
      to: plusHour(slot),
    })

    if (result.ok && result.drive) {
      setBooked(result.drive)
      notify(t('drive.success', { date: formatDate(`${date}T12:00:00`, lang), time: slot }), 'success')
      return
    }

    setConflict({ vehicle: result.vehicleClash, seller: result.sellerClash })
    setCnhRefused(!result.cnhOk)
  }

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  if (booked) {
    const bookedVehicle = vehicleById(vehicles, booked.vehicleId)
    const bookedSeller = sellerById(sellers, booked.sellerId)
    const bookedCustomer = customerById(customers, booked.customerId)
    return (
      <div className="surface-card rounded-2xl border p-6 text-center md:p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/15">
          <IconBase name="check-circle" size={30} />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-heading">
          {t('drive.success', { date: formatDate(`${booked.date}T12:00:00`, lang), time: booked.from })}
        </h3>
        <dl className="mx-auto mt-6 max-w-sm space-y-2.5 text-left text-sm">
          <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
            <dt className="text-muted">{t('common.vehicle')}</dt>
            <dd className="font-medium text-heading">
              {bookedVehicle ? vehicleLabel(models, brands, bookedVehicle) : '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
            <dt className="text-muted">{t('common.seller')}</dt>
            <dd className="font-medium text-heading">{bookedSeller?.name ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
            <dt className="text-muted">{t('common.customer')}</dt>
            <dd className="font-medium text-heading">{bookedCustomer?.name ?? '—'}</dd>
          </div>
        </dl>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ---- Passos ---- */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {[t('drive.step1'), t('drive.step2'), t('drive.step3')].map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-xl border p-3.5 ${
              step === i ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                step >= i ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              {i + 1}
            </span>
            <span className="text-sm font-medium text-heading">{label}</span>
          </li>
        ))}
      </ol>

      <div className="surface-card rounded-2xl border p-5 md:p-6">
        {/* ---- 1. Veículo ---- */}
        {step === 0 && (
          <div>
            <h3 className="font-semibold text-heading">{t('drive.chooseVehicle')}</h3>
            <div className="mt-4 grid max-h-96 gap-3 overflow-y-auto sm:grid-cols-2">
              {showcase.slice(0, 24).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleId(v.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    vehicleId === v.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed hover:border-brand-300'
                  }`}
                >
                  <img
                    src={dlImage(v.photoSeeds[0] ?? v.slug, 160, 120)}
                    alt=""
                    loading="lazy"
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-heading">
                      {vehicleLabel(models, brands, v)}
                    </span>
                    <span className="block text-xs text-muted">{v.modelYear}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="focus-ring mt-5 flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              {t('drive.nextStep')}
              <IconBase name="arrow-right" size={16} />
            </button>
          </div>
        )}

        {/* ---- 2. Dia, vendedor e horário ---- */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="dr-seller">
                {t('drive.chooseSeller')}
              </label>
              <select id="dr-seller" value={sellerId} onChange={(e) => setSellerId(Number(e.target.value))} className={control}>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-heading">{t('drive.chooseDay')}</span>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {days.map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => setDayOffset(offset)}
                    className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-center transition ${
                      dayOffset === offset ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body'
                    }`}
                  >
                    <span className="block text-xs opacity-80">
                      {offset === 0 ? t('common.today') : offset === 1 ? t('common.tomorrow') : ''}
                    </span>
                    <span className="block text-sm font-semibold">
                      {formatDate(`${dayKey(offset)}T12:00:00`, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-heading">{t('drive.chooseSlot')}</span>
              <div className="flex flex-wrap gap-2">
                {SLOTS.map((from) => {
                  const clash = slotState(from)
                  const busy = Boolean(clash.vehicle || clash.seller)
                  return (
                    <button
                      key={from}
                      type="button"
                      disabled={busy}
                      onClick={() => setSlot(from)}
                      title={busy ? t('drive.slotTaken') : undefined}
                      className={`focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                        busy
                          ? 'cursor-not-allowed border-themed text-muted line-through opacity-50'
                          : slot === from
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-themed text-body hover:text-heading'
                      }`}
                    >
                      {from}
                    </button>
                  )
                })}
              </div>
              {SLOTS.every((from) => {
                const clash = slotState(from)
                return Boolean(clash.vehicle || clash.seller)
              }) && <p className="mt-2 text-xs text-error-600 dark:text-error-500">{t('drive.noSlots')}</p>}
            </div>

            {/* Aviso ao vivo: os dois choques aparecem separados. */}
            {(liveClash.vehicle || liveClash.seller) && (
              <div className="rounded-xl border border-warning-200 bg-warning-50 p-3.5 text-sm dark:border-warning-500/30 dark:bg-warning-500/10">
                {liveClash.vehicle && (
                  <p className="flex items-start gap-2 text-warning-700 dark:text-warning-500">
                    <IconBase name="car" size={15} className="mt-0.5" />
                    {t('drive.conflictVehicle', { time: `${liveClash.vehicle.from}–${liveClash.vehicle.to}` })}
                  </p>
                )}
                {liveClash.seller && (
                  <p className="mt-1.5 flex items-start gap-2 text-warning-700 dark:text-warning-500">
                    <IconBase name="user" size={15} className="mt-0.5" />
                    {t('drive.conflictSeller', { name: sellerById(sellers, liveClash.seller.sellerId)?.name ?? '—' })}
                  </p>
                )}
              </div>
            )}
            {!liveClash.vehicle && !liveClash.seller && (
              <p className="flex items-center gap-2 text-sm text-success-600 dark:text-success-500">
                <IconBase name="check-circle" size={15} />
                {t('drive.bothFree')}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="focus-ring flex h-11 items-center rounded-lg border border-themed px-5 text-sm font-medium text-body"
              >
                {t('drive.back')}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                {t('drive.nextStep')}
                <IconBase name="arrow-right" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ---- 3. Dados e CNH ---- */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-themed p-3.5 text-sm">
              <p className="font-medium text-heading">{vehicle ? vehicleLabel(models, brands, vehicle) : '—'}</p>
              <p className="text-xs text-muted">
                {formatDate(`${date}T12:00:00`, lang)} · {slot}–{plusHour(slot)} ·{' '}
                {sellerById(sellers, sellerId)?.name ?? '—'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="dr-name">
                  {t('drive.yourName')}
                </label>
                <input id="dr-name" value={name} onChange={(e) => setName(e.target.value)} className={control} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="dr-phone">
                  {t('drive.yourPhone')}
                </label>
                <input id="dr-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={control} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="dr-email">
                  {t('drive.yourEmail')}
                </label>
                <input id="dr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={control} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="dr-cnh">
                  {t('drive.cnh')}
                </label>
                <input id="dr-cnh" type="date" value={cnhUntil} onChange={(e) => setCnhUntil(e.target.value)} className={control} />
                <p className="mt-1 text-xs text-muted">{t('drive.cnhHint')}</p>
              </div>
            </div>

            {(conflict?.vehicle || conflict?.seller || cnhRefused) && (
              <div className="rounded-xl border border-error-200 bg-error-50 p-4 text-sm dark:border-error-500/30 dark:bg-error-500/10">
                <p className="font-semibold text-error-700 dark:text-error-500">{t('drive.refusedTitle')}</p>
                <ul className="mt-2 space-y-1.5 text-error-600 dark:text-error-500">
                  {conflict?.vehicle && (
                    <li className="flex items-start gap-2">
                      <IconBase name="car" size={15} className="mt-0.5" />
                      {t('drive.conflictVehicle', { time: `${conflict.vehicle.from}–${conflict.vehicle.to}` })}
                    </li>
                  )}
                  {conflict?.seller && (
                    <li className="flex items-start gap-2">
                      <IconBase name="user" size={15} className="mt-0.5" />
                      {t('drive.conflictSeller', { name: sellerById(sellers, conflict.seller.sellerId)?.name ?? '—' })}
                    </li>
                  )}
                  {cnhRefused && (
                    <li className="flex items-start gap-2">
                      <IconBase name="ban" size={15} className="mt-0.5" />
                      {t('drive.conflictCnh')}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="focus-ring flex h-11 items-center rounded-lg border border-themed px-5 text-sm font-medium text-body"
              >
                {t('drive.back')}
              </button>
              <button
                type="button"
                onClick={submit}
                className="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                <IconBase name="calendar" size={16} />
                {t('drive.confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
