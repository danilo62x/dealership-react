import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { customerById, dealPrice, dealsOfStage, sellerById, STAGES, vehicleById, vehicleLabel } from '@/data/query'
import { formatCurrency } from '@/lib/format'
import Avatar from '@/components/ui/Avatar'
import IconBase from '@/components/ui/IconBase'
import type { Deal, DealStage } from '@/data/types'

const STAGE_TONE: Record<DealStage, string> = {
  contato: 'bg-gray-400',
  proposta: 'bg-brand-500',
  negociacao: 'bg-warning-500',
  aprovada: 'bg-success-500',
  perdida: 'bg-error-500',
}

/**
 * Funil arrastável. A coluna `aprovada` não é só um rótulo: soltar um card
 * nela reserva o veículo e ele sai da vitrine; tirar de lá devolve o carro,
 * sem zerar os dias em estoque.
 */
export default function DealBoard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const deals = useDealerStore((s) => s.deals)
  const vehicles = useDealerStore((s) => s.vehicles)
  const customers = useDealerStore((s) => s.customers)
  const sellers = useDealerStore((s) => s.sellers)
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const moveDeal = useDealerStore((s) => s.moveDeal)

  const notify = useUiStore((s) => s.notify)
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<DealStage | null>(null)

  const drop = (stage: DealStage) => {
    setOver(null)
    if (dragging === null) return
    const deal = deals.find((d) => d.id === dragging)
    setDragging(null)
    if (!deal || deal.stage === stage) return

    const vehicle = vehicleById(vehicles, deal.vehicleId)
    const name = vehicle ? vehicleLabel(models, brands, vehicle) : t('common.vehicle')

    moveDeal(deal.id, stage)
    notify(t('deals.moved', { stage: t(`status.deal.${stage}`) }), 'info')

    if (stage === 'aprovada' && vehicle?.state === 'disponivel') {
      notify(t('deals.reserved', { name }), 'warning')
    }
    if (deal.stage === 'aprovada' && stage !== 'aprovada' && vehicle?.state === 'reservado') {
      notify(t('deals.released', { name }), 'success')
    }
  }

  const card = (deal: Deal) => {
    const vehicle = vehicleById(vehicles, deal.vehicleId)
    const customer = customerById(customers, deal.customerId)
    const seller = sellerById(sellers, deal.sellerId)

    return (
      <li
        key={deal.id}
        draggable
        onDragStart={() => setDragging(deal.id)}
        onDragEnd={() => setDragging(null)}
        className={`surface-card cursor-grab rounded-xl border p-3 transition active:cursor-grabbing ${
          dragging === deal.id ? 'opacity-40' : 'hover:shadow-theme-sm'
        }`}
      >
        <Link to={`/app/proposta/${deal.id}`} className="block">
          <p className="line-clamp-2 text-sm font-medium text-heading">
            {vehicle ? vehicleLabel(models, brands, vehicle) : '—'}
          </p>
          <p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(dealPrice(deal, vehicle), lang)}
          </p>
          {deal.discount > 0 && (
            <p className="text-[11px] text-muted">
              {t('deal.discount')}: {formatCurrency(deal.discount, lang)}
            </p>
          )}
        </Link>

        <div className="mt-3 flex items-center gap-2 border-t border-themed pt-2.5">
          <Avatar src={seller?.avatar} name={seller?.name} size="xs" />
          <span className="min-w-0 flex-1 truncate text-[11px] text-muted">{customer?.name ?? '—'}</span>
          {deal.tradeInId && <IconBase name="refresh-cw" size={12} className="text-brand-500" />}
          {deal.finance && <IconBase name="credit-card" size={12} className="text-muted" />}
        </div>
      </li>
    )
  }

  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-xs text-muted">
        <IconBase name="info" size={14} />
        {t('deals.approvedNote')}
      </p>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {STAGES.map((stage) => {
          const rows = dealsOfStage(deals, stage)
          const total = rows.reduce((sum, d) => sum + dealPrice(d, vehicleById(vehicles, d.vehicleId)), 0)

          return (
            <section
              key={stage}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(stage)
              }}
              onDragLeave={() => setOver((s) => (s === stage ? null : s))}
              onDrop={drop.bind(null, stage)}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition ${
                over === stage ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/10' : 'surface-card'
              }`}
            >
              <header className="mb-3 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${STAGE_TONE[stage]}`} />
                <h3 className="text-sm font-semibold text-heading">{t(`status.deal.${stage}`)}</h3>
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {rows.length}
                </span>
              </header>
              <p className="mb-3 text-[11px] text-muted">
                {t('deals.stageValue')}: {formatCurrency(total, lang)}
              </p>

              <ul className="flex max-h-[62vh] flex-col gap-2 overflow-y-auto pr-0.5">
                {rows.map(card)}
                {!rows.length && (
                  <li className="rounded-xl border border-dashed border-themed px-3 py-6 text-center text-xs text-muted">
                    {t('deals.emptyColumn')}
                  </li>
                )}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
