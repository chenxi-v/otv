import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  validateSession: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: false,
      username: null,

      login: async (username: string, password: string) => {
        const configUsername = import.meta.env.VITE_USERNAME
        const configPassword = import.meta.env.VITE_ACCESS_PASSWORD

        if (!configUsername || !configPassword) {
          console.error('[Auth] 用户名或密码未配置')
          return false
        }

        if (username === configUsername && password === configPassword) {
          set({ isAuthenticated: true, username })
          console.log('[Auth] 登录成功:', username)
          return true
        }

        console.error('[Auth] 登录失败: 用户名或密码错误')
        return false
      },

      logout: () => {
        set({ isAuthenticated: false, username: null })
        console.log('[Auth] 已登出')
      },

      validateSession: async () => {
        const configUsername = import.meta.env.VITE_USERNAME
        const configPassword = import.meta.env.VITE_ACCESS_PASSWORD

        if (!configUsername || !configPassword) {
          console.error('[Auth] 用户名或密码未配置')
          return false
        }

        const state = useAuthStore.getState()
        if (state.isAuthenticated && state.username === configUsername) {
          console.log('[Auth] 会话有效')
          return true
        }

        console.log('[Auth] 会话无效')
        return false
      },
    }),
    {
      name: 'ouonnki-tv-auth',
    }
  )
)
