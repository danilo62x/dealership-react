import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/hooks/useNow'
import { OPTION_CATALOG } from '@/data/mock'
import { appraise, brandById } from '@/data/query'
import IconBase from '@/components/ui/IconBase'
import AppraisalBreakdown from './AppraisalBreakdown'
import type { Appraisal, Condition } from '@/data/types'

const CONDITIONS: Condition[] = ['excelente', 'bom', 'regular', 'ruim']

export interface TradeInInput {
  modelId: number
  year: number
  km: number
  condition: Condition
  options: string[]
}

interface Props {
  /** Botão de gravar a avaliação; sem ele o formulário só estima. */
  onSubmit?: (appraisal: Appraisal, input: TradeInInput) => void
  submitLabel?: string
}

/**
 * Formulário de troca. A faixa sai na hora e os ajustes aparecem abertos —
 * nada de "entraremos em contato com uma proposta".
 */
export default function TradeInForm({ onSubmit, submitLabel }: Props) {
  const { t } = useTranslation()
  const now = useNow()
  const models = useDealerStore((s) => s.models)
  const brands = useDealerStore((s) => s.brands)
  const rules = useDealerStore((s) => s.rules)

  const currentYear = new Date(now).getFullYear()

  const [modelId, setModelId] = useState(models[0]?.id ?? 1)
  const [year, setYear] = useState(currentYear - 5)
  const [km, setKm] = useState(60000)
  const [condition, setCondition] = useState<Condition>('bom')
  const [options, setOptions] = useState<string[]>(['Ar-condicionado', 'Central multimídia'])

  const input: TradeInInput = useMemo(
    () => ({ modelId, year, km, condition, options }),
    [modelId, year, km, condition, options]
  )
  const appraisal = useMemo(() => appraise(input, models, rules, now), [input, models, rules, now])

  const toggleOption = (opt: string) =>
    setOptions((list) => (list.includes(opt) ? list.filter((o) => o !== opt) : [...list, opt]))

  const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'

  const years: number[] = []
  for (let y = currentYear; y >= currentYear - 20; y--) years.push(y)

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="surface-card rounded-2xl border p-5 md:p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="ti-model">
              {t('appraisal.model')}
            </label>
            <select id="ti-model" value={modelId} onChange={(e) => setModelId(Number(e.target.value))} className={control}>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {brandById(brands, model.brandId)?.name} {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="ti-year">
                {t('appraisal.year')}
              </label>
              <select id="ti-year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={control}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-heading" htmlFor="ti-km">
                {t('appraisal.km')}
              </label>
              <input
                id="ti-km"
                type="number"
                min={0}
                step={1000}
                value={km}
                onChange={(e) => setKm(Math.max(0, Number(e.target.value)))}
                className={control}
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-heading">{t('appraisal.condition')}</span>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                    condition === c ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body hover:text-heading'
                  }`}
                >
                  {t(`status.condition.${c}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-heading">{t('appraisal.options')}</span>
            <div className="flex flex-wrap gap-2">
              {OPTION_CATALOG.map((opt) => {
                const active = options.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                        : 'border-themed text-muted hover:text-body'
                    }`}
                  >
                    {active && <IconBase name="check" size={12} strokeWidth={2.5} />}
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {onSubmit && (
            <button
              type="button"
              onClick={() => onSubmit(appraisal, input)}
              className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <IconBase name="calculator" size={16} />
              {submitLabel ?? t('appraisal.cta')}
            </button>
          )}
        </div>
      </div>

      <AppraisalBreakdown appraisal={appraisal} />
    </div>
  )
}
