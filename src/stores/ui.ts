import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

export type StockView = 'grid' | 'list'

let toastId = 0

interface UiState {
  darkMode: boolean
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  toasts: Toast[]
  cookiesAccepted: boolean
  showCookieBanner: boolean
  /** Grade ou lista na vitrine de veículos — persistido. */
  stockView: StockView

  toggleDarkMode: () => void
  setDarkMode: (val: boolean) => void
  applyTheme: () => void
  toggleSidebar: () => void
  toggleSidebarMobile: (val?: boolean) => void
  setStockView: (view: StockView) => void
  notify: (message: string, type?: ToastType, duration?: number) => void
  notifySuccess: (message: string) => void
  notifyError: (message: string) => void
  notifyWarning: (message: string) => void
  dismissToast: (id: number) => void
  acceptCookies: () => void
  declineCookies: () => void
  openCookieBanner: () => void
  closeCookieBanner: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      toasts: [],
      cookiesAccepted: false,
      showCookieBanner: false,
      stockView: 'grid',

      toggleDarkMode() {
        set({ darkMode: !get().darkMode })
        get().applyTheme()
      },
      setDarkMode(val) {
        set({ darkMode: val })
        get().applyTheme()
      },
      applyTheme() {
        const root = document.documentElement
        if (get().darkMode) root.classList.add('dark')
        else root.classList.remove('dark')
      },
      toggleSidebar() {
        set({ sidebarCollapsed: !get().sidebarCollapsed })
      },
      toggleSidebarMobile(val) {
        set({ sidebarMobileOpen: val !== undefined ? val : !get().sidebarMobileOpen })
      },
      setStockView(view) {
        set({ stockView: view })
      },
      notify(message, type = 'info', duration = 4000) {
        const id = ++toastId
        set({ toasts: [...get().toasts, { id, message, type, duration }] })
        setTimeout(() => get().dismissToast(id), duration)
      },
      notifySuccess(message) {
        get().notify(message, 'success')
      },
      notifyError(message) {
        get().notify(message, 'error')
      },
      notifyWarning(message) {
        get().notify(message, 'warning')
      },
      dismissToast(id) {
        set({ toasts: get().toasts.filter((t) => t.id !== id) })
      },
      acceptCookies() {
        set({ cookiesAccepted: true, showCookieBanner: false })
      },
      declineCookies() {
        set({ cookiesAccepted: false, showCookieBanner: false })
      },
      openCookieBanner() {
        set({ showCookieBanner: true })
      },
      closeCookieBanner() {
        set({ showCookieBanner: false })
      },
    }),
    {
      name: 'dl-ui',
      partialize: (s) => ({
        darkMode: s.darkMode,
        sidebarCollapsed: s.sidebarCollapsed,
        cookiesAccepted: s.cookiesAccepted,
        stockView: s.stockView,
      }),
    }
  )
)
