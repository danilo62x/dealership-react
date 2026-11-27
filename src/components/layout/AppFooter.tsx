import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function AppFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="surface-header border-t px-4 py-4 md:px-6 2xl:px-10">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-xs text-muted">
          © {year} {t('brand')}. {t('footer.rights')}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <Link to="/vender-meu-carro" className="hover:text-brand-500">
            {t('footer.notice')}
          </Link>
          <a href="#" className="hover:text-brand-500">
            {t('footer.help')}
          </a>
          <a href="#" className="hover:text-brand-500">
            {t('footer.privacy')}
          </a>
        </div>
      </div>
    </footer>
  )
}
