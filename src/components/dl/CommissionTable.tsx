import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { commission } from '@/data/query'
import { formatCurrency, formatPercent } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'

/** Exemplo de margem usado em cada faixa, para a conta não ficar abstrata. */
const EXAMPLE_OFFSET = 2500

/**
 * As faixas de comissão, com o exemplo de quanto o vendedor leva em cada uma.
 * A comissão é uma fatia da margem, então uma venda com margem maior sobe de
 * faixa e paga proporcionalmente mais.
 */
export default function CommissionTable() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const rules = useDealerStore((s) => s.rules)

  return (
    <div className="surface-card rounded-2xl border p-5 md:p-6">
      <h3 className="flex items-center gap-2 font-semibold text-heading">
        <IconBase name="percent" size={18} className="text-brand-500" />
        {t('sellers.tiersTitle')}
      </h3>
      <p className="mt-1 text-xs text-muted">{t('sellers.tiersSubtitle')}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-themed text-xs text-muted">
              <th className="py-2 pr-4 font-medium">{t('sellers.tierFrom')}</th>
              <th className="py-2 pr-4 font-medium">{t('sellers.tierPct')}</th>
              <th className="py-2 font-medium">{t('common.details')}</th>
            </tr>
          </thead>
          <tbody>
            {rules.commissionTiers.map(([min, pct]) => {
              const example = min + EXAMPLE_OFFSET
              return (
                <tr key={min} className="border-b border-themed last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-heading">{formatCurrency(min, lang)}</td>
                  <td className="py-2.5 pr-4 text-body">{formatPercent(pct, lang)}</td>
                  <td className="py-2.5 text-xs text-muted">
                    {t('sellers.tierExample', {
                      margin: formatCurrency(example, lang),
                      value: formatCurrency(commission(example, rules), lang),
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
