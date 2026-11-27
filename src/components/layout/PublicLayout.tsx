import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'
import ToastStack from '@/components/ui/ToastStack'
import CookieBanner from '@/components/ui/CookieBanner'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden" style={{ backgroundColor: 'var(--tx-body-bg)' }}>
      <ScrollToTop />
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <ToastStack />
      <CookieBanner />
    </div>
  )
}
