import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IconBase from '@/components/ui/IconBase'
import { STORE } from '@/data/mock'

const CATEGORIES = ['hatch', 'sedan', 'suv', 'picape'] as const

export default function PublicFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="surface-card border-t border-themed">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                <IconBase name="car" size={18} />
              </span>
              <span className="text-lg font-bold text-heading">{t('brand')}</span>
            </Link>
            <p className="mt-4 text-sm text-muted">{t('footer.tagline')}</p>
            <p className="mt-4 text-xs text-muted">{STORE.address}</p>
            <p className="text-xs text-muted">
              {STORE.phone} · {STORE.hours}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-2 text-sm">
            <Link to="/estoque" className="text-muted transition hover:text-brand-600">
              {t('nav.stock')}
            </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to={`/estoque?segmento=${category}`}
                className="text-muted transition hover:text-brand-600"
              >
                {t(`spec.category.${category}`)}
              </Link>
            ))}
            <Link to="/financiamento" className="text-muted transition hover:text-brand-600">
              {t('nav.finance')}
            </Link>
            <Link to="/test-drive" className="text-muted transition hover:text-brand-600">
              {t('nav.testDrive')}
            </Link>
            <Link to="/vender-meu-carro" className="text-muted transition hover:text-brand-600">
              {t('nav.sellCar')}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-themed pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {year} {t('brand')}. {t('footer.rights')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
            <Link to="/vender-meu-carro" className="hover:text-brand-500">
              {t('footer.notice')}
            </Link>
            <a href="#" className="hover:text-brand-500">
              {t('footer.privacy')}
            </a>
            <a href="#" className="hover:text-brand-500">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
