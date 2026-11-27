import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import DriveScheduler from '@/components/dl/DriveScheduler'

export default function TestDrivePage() {
  const { t } = useTranslation()
  usePageTitle(t('drive.title'))

  // A página do veículo manda o carro escolhido pelo state da navegação.
  const location = useLocation()
  const initialVehicleId = (location.state as { vehicleId?: number } | null)?.vehicleId

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-title-sm font-bold text-heading">{t('drive.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('drive.subtitle')}</p>
      </header>

      <DriveScheduler initialVehicleId={initialVehicleId} />
    </div>
  )
}
