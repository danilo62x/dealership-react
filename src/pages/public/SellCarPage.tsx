import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { VISITOR_CUSTOMER_ID } from '@/data/mock'
import { formatCurrency } from '@/lib/format'
import IconBase from '@/components/ui/IconBase'
import TradeInForm, { type TradeInInput } from '@/components/dl/TradeInForm'
import type { Appraisal } from '@/data/types'

export default function SellCarPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  usePageTitle(t('appraisal.title'))

  const saveTradeIn = useDealerStore((s) => s.saveTradeIn)
  const notify = useUiStore((s) => s.notifySuccess)
  const [saved, setSaved] = useState<Appraisal | null>(null)

  const submit = (appraisal: Appraisal, input: TradeInInput) => {
    saveTradeIn({
      customerId: VISITOR_CUSTOMER_ID,
      modelId: input.modelId,
      year: input.year,
      km: input.km,
      condition: input.condition,
      options: input.options,
      accepted: false,
    })
    setSaved(appraisal)
    notify(t('appraisal.saved'))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-title-sm font-bold text-heading">{t('appraisal.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t('appraisal.subtitle')}</p>
      </header>

      <TradeInForm onSubmit={submit} />

      {saved && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-success-200 bg-success-50 p-5 dark:border-success-500/30 dark:bg-success-500/10">
          <IconBase name="check-circle" size={20} className="mt-0.5 text-success-600" />
          <div>
            <p className="text-sm font-semibold text-heading">
              {t('appraisal.result')}: {formatCurrency(saved.value, lang)}
            </p>
            <p className="mt-1 text-sm text-muted">{t('appraisal.applyToDeal')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
