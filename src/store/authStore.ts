import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
  } | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (email: string, password: string) => {
        // Hard-coded credentials
        if (email === 'admin@gmail.com' && password === '123456') {
          set({
            isAuthenticated: true,
            user: { email }
          })
          return true
        }
        return false
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
)