import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import PageHeader from '@/components/app/PageHeader'
import DealBoard from '@/components/dl/DealBoard'

export default function DealsPage() {
  const { t } = useTranslation()
  usePageTitle(t('deals.title'))

  return (
    <div>
      <PageHeader
        title={t('deals.title')}
        subtitle={t('deals.subtitle')}
        crumbs={[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('deals.title') }]}
      />
      <DealBoard />
    </div>
  )
}
