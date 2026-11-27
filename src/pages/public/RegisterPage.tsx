import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import IconBase from '@/components/ui/IconBase'
import AuthShell from './AuthShell'

export default function RegisterPage() {
  const { t } = useTranslation()
  usePageTitle(t('auth.registerTitle'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const register = useAuthStore((s) => s.register)
  const notify = useUiStore((s) => s.notifySuccess)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await register(name, email, password)
    setLoading(false)
    if (!ok) {
      setError(t('auth.loginError'))
      return
    }
    notify(t('auth.registerSuccess'))
    navigate('/app')
  }

  const control =
    'h-11 w-full rounded-lg border border-themed bg-gray-50 pl-10 pr-3 text-sm text-body outline-none focus:border-brand-300 focus-ring dark:bg-gray-900'

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
            {t('auth.loginLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-heading" htmlFor="name">
            {t('auth.name')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconBase name="user" size={18} />
            </span>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Camila Barreto"
              className={control}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-heading" htmlFor="email">
            {t('auth.email')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconBase name="mail" size={18} />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@garagem.com.br"
              className={control}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-heading" htmlFor="password">
            {t('auth.password')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconBase name="lock" size={18} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${control} pr-10`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={t('auth.password')}
            >
              <IconBase name={showPassword ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-body">
          <input
            type="checkbox"
            required
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-themed accent-brand-500"
          />
          <span className="min-w-0">{t('auth.terms')}</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t('auth.registering')}
            </span>
          ) : (
            t('auth.registerCta')
          )}
        </button>

        {error && (
          <p className="rounded-lg bg-error-50 px-4 py-2 text-center text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
            {error}
          </p>
        )}
      </form>
    </AuthShell>
  )
}
