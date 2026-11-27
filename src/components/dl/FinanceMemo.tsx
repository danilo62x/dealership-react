import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import type { Simulation } from '@/data/types'

interface Props {
  simulation: Simulation
  /** Sem o cabeçalho, para encaixar dentro de outro card. */
  bare?: boolean
}

/**
 * A memória do cálculo, linha a linha, na ordem em que a conta acontece.
 * Cada linha traz o rótulo, a fórmula já com os números substituídos e o
 * resultado — é isso que separa uma simulação de um número solto na tela.
 */
export default function FinanceMemo({ simulation, bare = false }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const render = (value: number, kind: 'money' | 'rate' | 'plain') => {
    if (kind === 'money') return formatCurrency(value, lang)
    if (kind === 'rate') return `${(value * 100).toFixed(2).replace('.', ',')}%`
    return value.toLocaleString(lang, { maximumFractionDigits: 6 })
  }

  return (
    <div className={bare ? '' : 'surface-card rounded-2xl border p-5 md:p-6'}>
      {!bare && (
        <div className="mb-4">
          <h3 className="flex items-center gap-2 font-semibold text-heading">
            <IconBase name="calculator" size={18} className="text-brand-500" />
            {t('finance.memoTitle')}
          </h3>
          <p className="mt-1 text-xs text-muted">{t('finance.memoSubtitle')}</p>
        </div>
      )}

      <ol className="divide-y divide-themed overflow-hidden rounded-xl border border-themed">
        {simulation.steps.map((step, i) => (
          <li key={step.key} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-heading">{t(`finance.memo.${step.key}`)}</p>
              <p className="mt-0.5 break-words font-mono text-xs text-muted">{step.formula}</p>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold sm:text-right ${
                step.key === 'cet' || step.key === 'installment' ? 'text-brand-600 dark:text-brand-400' : 'text-heading'
              }`}
            >
              {render(step.value, step.kind)}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-muted">{t('finance.cetHint')}</p>
    </div>
  )
}
