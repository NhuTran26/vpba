import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth'
import '../amplifyConfig'

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
    jwt?: string
  } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, password: string) => {
        try {
          const { isSignedIn } = await signIn({ username: email, password })
          if (isSignedIn) {
            const session = await fetchAuthSession()
            const jwt = session.tokens?.idToken?.toString() || ''
            set({
              isAuthenticated: true,
              user: { email, jwt }
            })
          } else {
            set({ isAuthenticated: false, user: null })
            throw new Error('Sign in not complete')
          }
        } catch (error) {
          set({ isAuthenticated: false, user: null })
          throw error
        }
      },
      logout: async () => {
        await signOut()
        set({
          isAuthenticated: false,
          user: null
        })
      },
      checkAuth: async () => {
        console.log('checkAuth called');
        try {
          const session = await fetchAuthSession();
          console.log('fetchAuthSession result:', session);
          if (session.tokens?.idToken) {
            set({ isAuthenticated: true });
          } else {
            set({ isAuthenticated: false, user: null });
          }
        } catch (e) {
          console.log('checkAuth error:', e);
          set({ isAuthenticated: false, user: null });
        }
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