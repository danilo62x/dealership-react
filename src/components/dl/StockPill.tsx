import { useTranslation } from 'react-i18next'
import Badge from '@/components/ui/Badge'
import type { Condition, DealStage, DriveStatus, StockState } from '@/data/types'

type Color = 'brand' | 'success' | 'warning' | 'error' | 'gray'

const STOCK_COLOR: Record<StockState, Color> = {
  disponivel: 'success',
  reservado: 'warning',
  vendido: 'gray',
  preparacao: 'brand',
}

const DEAL_COLOR: Record<DealStage, Color> = {
  contato: 'gray',
  proposta: 'brand',
  negociacao: 'warning',
  aprovada: 'success',
  perdida: 'error',
}

const DRIVE_COLOR: Record<DriveStatus, Color> = {
  agendado: 'brand',
  realizado: 'success',
  cancelado: 'gray',
  faltou: 'error',
}

const CONDITION_COLOR: Record<Condition, Color> = {
  excelente: 'success',
  bom: 'brand',
  regular: 'warning',
  ruim: 'error',
}

/** Situação do veículo no estoque — é ela que decide a vitrine. */
export default function StockPill({ state }: { state: StockState }) {
  const { t } = useTranslation()
  return (
    <Badge color={STOCK_COLOR[state]} dot>
      {t(`status.stock.${state}`)}
    </Badge>
  )
}

export function DealStagePill({ stage }: { stage: DealStage }) {
  const { t } = useTranslation()
  return (
    <Badge color={DEAL_COLOR[stage]} dot>
      {t(`status.deal.${stage}`)}
    </Badge>
  )
}

export function DriveStatusPill({ status }: { status: DriveStatus }) {
  const { t } = useTranslation()
  return (
    <Badge color={DRIVE_COLOR[status]} dot>
      {t(`status.drive.${status}`)}
    </Badge>
  )
}

export function ConditionPill({ condition }: { condition: Condition }) {
  const { t } = useTranslation()
  return <Badge color={CONDITION_COLOR[condition]}>{t(`status.condition.${condition}`)}</Badge>
}
