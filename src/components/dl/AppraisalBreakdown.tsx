import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import type { Adjustment, Appraisal } from '@/data/types'

interface Props {
  appraisal: Appraisal
  /** Sem o cartão em volta, para encaixar dentro de outro bloco. */
  bare?: boolean
}

/**
 * Cada ajuste da avaliação em UMA linha, com o valor em reais — positivo ou
 * negativo. Sem essa abertura o cliente só veria o número final e teria de
 * acreditar nele.
 */
export default function AppraisalBreakdown({ appraisal, bare = false }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const label = (adj: Adjustment) => {
    if (adj.key.startsWith('condition.')) {
      const condition = adj.key.slice('condition.'.length)
      return t('appraisal.adj.conditionLabel', { detail: t(`status.condition.${condition}`) })
    }
    return t(`appraisal.adj.${adj.key}`, { detail: adj.detail })
  }

  const body = (
    <>
      <ul className="divide-y divide-themed overflow-hidden rounded-xl border border-themed">
        <li className="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3 dark:bg-white/5">
          <span className="text-sm font-medium text-heading">{t('appraisal.reference')}</span>
          <span className="text-sm font-semibold text-heading">{formatCurrency(appraisal.reference, lang)}</span>
        </li>
        {appraisal.adjustments.map((adj) => (
          <li key={adj.key} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="min-w-0 text-sm text-body">{label(adj)}</span>
            <span
              className={`shrink-0 text-sm font-semibold ${
                adj.amount < 0
                  ? 'text-error-600 dark:text-error-500'
                  : adj.amount > 0
                    ? 'text-success-600 dark:text-success-500'
                    : 'text-muted'
              }`}
            >
              {adj.amount > 0 ? '+' : ''}
              {formatCurrency(adj.amount, lang)}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
          <span className="text-sm font-semibold text-heading">{t('appraisal.result')}</span>
          <span className="text-base font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(appraisal.value, lang)}
          </span>
        </li>
      </ul>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <IconBase name="info" size={14} />
        {t('appraisal.range', {
          low: formatCurrency(appraisal.low, lang),
          high: formatCurrency(appraisal.high, lang),
        })}
      </p>
    </>
  )

  if (bare) return <div>{body}</div>

  return (
    <div className="surface-card rounded-2xl border p-5 md:p-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-heading">
        <IconBase name="calculator" size={18} className="text-brand-500" />
        {t('appraisal.breakdown')}
      </h3>
      {body}
    </div>
  )
}
