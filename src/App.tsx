import { useEffect, lazy, Suspense, type ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import AppLayout from '@/components/layout/AppLayout'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

// Site público
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const StockPage = lazy(() => import('@/pages/public/StockPage'))
const VehiclePage = lazy(() => import('@/pages/public/VehiclePage'))
const FinancePage = lazy(() => import('@/pages/public/FinancePage'))
const TestDrivePage = lazy(() => import('@/pages/public/TestDrivePage'))
const SellCarPage = lazy(() => import('@/pages/public/SellCarPage'))

// Autenticação (layout em branco)
const LoginPage = lazy(() => import('@/pages/public/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'))

// Área do showroom
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'))
const StockAdminPage = lazy(() => import('@/pages/app/StockAdminPage'))
const VehicleAdminPage = lazy(() => import('@/pages/app/VehicleAdminPage'))
const DealsPage = lazy(() => import('@/pages/app/DealsPage'))
const DealPage = lazy(() => import('@/pages/app/DealPage'))
const DrivesPage = lazy(() => import('@/pages/app/DrivesPage'))
const AppraisalsPage = lazy(() => import('@/pages/app/AppraisalsPage'))
const CustomersPage = lazy(() => import('@/pages/app/CustomersPage'))
const SellersPage = lazy(() => import('@/pages/app/SellersPage'))
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/app/NotFoundPage'))

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()
  if (!isAuth) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <>{children}</>
}

function PageLoader() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ backgroundColor: 'var(--tx-body-bg)' }}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  const applyTheme = useUiStore((s) => s.applyTheme)

  useEffect(() => {
    applyTheme()
    document.title = 'Garagem — Concessionária'
  }, [applyTheme])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Site público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/estoque" element={<StockPage />} />
          <Route path="/veiculo/:slug" element={<VehiclePage />} />
          <Route path="/financiamento" element={<FinancePage />} />
          <Route path="/test-drive" element={<TestDrivePage />} />
          <Route path="/vender-meu-carro" element={<SellCarPage />} />
        </Route>

        {/* Autenticação */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Área do showroom */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="estoque" element={<StockAdminPage />} />
          <Route path="veiculo/:id" element={<VehicleAdminPage />} />
          <Route path="propostas" element={<DealsPage />} />
          <Route path="proposta/:id" element={<DealPage />} />
          <Route path="test-drives" element={<DrivesPage />} />
          <Route path="avaliacoes" element={<AppraisalsPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="vendedores" element={<SellersPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
