import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  name: string
  email: string
  role: string
  organization?: string
  /** Loja em que o usuário trabalha. */
  store?: string
}

/** Conta sugerida na tela de login. Qualquer e-mail/senha entra. */
export const DEMO_CREDENTIALS = { email: 'gerente@garagem.com.br', password: 'demo123' }

interface AuthState {
  user: User | null
  isAuthenticated: () => boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated() {
        return get().user !== null
      },
      // Autenticação fictícia: qualquer e-mail/senha não vazios entram.
      async login(email, password) {
        await new Promise((r) => setTimeout(r, 500))
        if (!email || !password) return false
        const isDemo = email === DEMO_CREDENTIALS.email
        const raw = email.split('@')[0].replace(/[._-]/g, ' ') || 'Gerente'
        const name = isDemo ? 'Marcelo Tavares' : raw.charAt(0).toUpperCase() + raw.slice(1)
        set({
          user: {
            id: 1,
            name,
            email,
            role: 'Gerente de vendas',
            organization: 'Garagem Veículos',
            store: 'Faria Lima',
          },
        })
        return true
      },
      async register(name, email, password) {
        await new Promise((r) => setTimeout(r, 500))
        if (!name || !email || !password) return false
        set({ user: { id: 1, name, email, role: 'Vendedor', organization: 'Garagem Veículos', store: '' } })
        return true
      },
      logout() {
        set({ user: null })
      },
      updateProfile(patch) {
        const user = get().user
        if (!user) return
        set({ user: { ...user, ...patch } })
      },
    }),
    { name: 'dl-auth', partialize: (s) => ({ user: s.user }) }
  )
)
