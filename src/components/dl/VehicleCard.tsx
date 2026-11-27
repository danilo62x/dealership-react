import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { dlImage } from '@/data/mock'
import { minDown, pmt, vehicleLabel, yearLabel } from '@/data/query'
import { formatCurrency, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import FuelBadge from './FuelBadge'
import StockPill from './StockPill'
import type { Vehicle } from '@/data/types'

interface Props {
  vehicle: Vehicle
  /** Mostra a situação do estoque — só faz sentido na área logada. */
  showState?: boolean
  compact?: boolean
}

/**
 * Card da vitrine. A parcela "a partir de" NÃO é um campo gravado: sai do
 * mesmo `pmt()` do simulador, com a entrada mínima da loja e o prazo máximo.
 */
export default function VehicleCard({ vehicle, showState = false, compact = false }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const rules = useDealerStore((s) => s.rules)

  const label = vehicleLabel(models, brands, vehicle)
  const down = minDown(vehicle.price, rules)
  const installment = pmt(vehicle.price - down, rules.defaultMonthlyRate, 48)

  return (
    <article className="surface-card group flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-theme-md">
      <Link to={`/veiculo/${vehicle.slug}`} className="relative block overflow-hidden">
        <img
          src={dlImage(vehicle.photoSeeds[0] ?? vehicle.slug, 640, 420)}
          alt={label}
          loading="lazy"
          className={`w-full object-cover transition duration-500 group-hover:scale-105 ${
            compact ? 'aspect-[16/10]' : 'aspect-[3/2]'
          }`}
        />
        {showState && (
          <span className="absolute left-3 top-3">
            <StockPill state={vehicle.state} />
          </span>
        )}
        <span className="absolute right-3 top-3">
          <FuelBadge fuel={vehicle.fuel} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-heading">
          <Link to={`/veiculo/${vehicle.slug}`} className="transition group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {label}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted">
          {yearLabel(vehicle)} · {formatNumber(vehicle.km, lang)} km · {vehicle.color}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <IconBase name="settings" size={13} />
            {t(`spec.transmission.${vehicle.transmission}`)}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconBase name="gauge" size={13} />
            {formatNumber(vehicle.km, lang)} km
          </span>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-lg font-bold text-heading">{formatCurrency(vehicle.price, lang)}</p>
          <p className="text-xs text-muted">
            {t('vehicle.fromInstallment', { value: `${formatCurrency(installment, lang)}${t('common.perMonth')}` })}
          </p>
        </div>
      </div>
    </article>
  )
}
