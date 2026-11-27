import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { modelById, yearLabel } from '@/data/query'
import { formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import type { Vehicle } from '@/data/types'

/** Ficha técnica em grade — cada linha vem do veículo, nada é escrito à mão. */
export default function SpecGrid({ vehicle }: { vehicle: Vehicle }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const models = useDealerStore((s) => s.models)
  const model = modelById(models, vehicle.modelId)

  const rows: { icon: string; label: string; value: string }[] = [
    { icon: 'calendar', label: t('vehicle.year'), value: yearLabel(vehicle) },
    { icon: 'gauge', label: t('vehicle.km'), value: `${formatNumber(vehicle.km, lang)} km` },
    { icon: 'settings', label: t('vehicle.transmission'), value: t(`spec.transmission.${vehicle.transmission}`) },
    { icon: 'fuel', label: t('vehicle.fuel'), value: t(`spec.fuel.${vehicle.fuel}`) },
    { icon: 'palette', label: t('vehicle.color'), value: vehicle.color },
    { icon: 'grid', label: t('vehicle.doors'), value: String(vehicle.doors) },
    { icon: 'car', label: t('vehicle.category'), value: model ? t(`spec.category.${model.category}`) : '—' },
    { icon: 'barcode', label: t('vehicle.plateEnd'), value: vehicle.plateEnd },
  ]

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl border border-themed p-3.5">
          <dt className="flex items-center gap-1.5 text-xs text-muted">
            <IconBase name={row.icon} size={14} />
            {row.label}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-heading">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
