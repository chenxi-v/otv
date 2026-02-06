import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  checkDatabaseConnection,
  isUpstashConfigured,
  syncFromDatabase,
  syncToDatabase,
  saveVideoSources,
  saveViewingHistory,
  saveSearchHistory,
  saveUserSettings,
  saveSearchCache,
} from '@/services/upstash.service'
import type { VideoApi, ViewingHistoryItem } from '@/types'
import type { SearchHistoryItem } from '@/types'

// 生成用户 ID（基于访问密码或随机生成）
const generateUserId = (): string => {
  // 如果有访问密码，使用密码作为用户标识的一部分
  const accessPassword = import.meta.env.VITE_ACCESS_PASSWORD
  if (accessPassword) {
    // 简单的哈希处理
    let hash = 0
    for (let i = 0; i < accessPassword.length; i++) {
      const char = accessPassword.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return `user_${Math.abs(hash).toString(16)}`
  }

  // 否则使用本地存储的随机 ID
  let userId = localStorage.getItem('ouonnki-tv-user-id')
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('ouonnki-tv-user-id', userId)
  }
  return userId
}

interface UpstashState {
  // 连接状态
  isConnected: boolean
  isChecking: boolean
  lastCheckedAt: number | null
  // 同步状态
  isSyncing: boolean
  lastSyncedAt: number | null
  // 是否启用数据库
  isEnabled: boolean
  // 用户 ID
  userId: string
}

interface UpstashActions {
  // 检查连接状态
  checkConnection: () => Promise<boolean>
  // 启用/禁用数据库
  setEnabled: (enabled: boolean) => void
  // 从数据库同步数据
  syncFromCloud: () => Promise<{
    videoSources: VideoApi[] | null
    viewingHistory: ViewingHistoryItem[] | null
    searchHistory: SearchHistoryItem[] | null
    settings: Record<string, unknown> | null
    searchCache: Record<string, unknown> | null
  } | null>
  // 同步数据到数据库
  syncToCloud: (data: {
    videoSources?: VideoApi[]
    viewingHistory?: ViewingHistoryItem[]
    searchHistory?: SearchHistoryItem[]
    settings?: Record<string, unknown>
    searchCache?: Record<string, unknown>
  }) => Promise<boolean>
  // 保存视频源
  saveVideoSources: (sources: VideoApi[]) => Promise<boolean>
  // 保存观看历史
  saveViewingHistory: (history: ViewingHistoryItem[]) => Promise<boolean>
  // 保存搜索历史
  saveSearchHistory: (history: SearchHistoryItem[]) => Promise<boolean>
  // 保存设置
  saveSettings: (settings: Record<string, unknown>) => Promise<boolean>
  // 保存搜索缓存
  saveSearchCache: (cache: Record<string, unknown>) => Promise<boolean>
  // 初始化
  initialize: () => void
}

type UpstashStore = UpstashState & UpstashActions

export const useUpstashStore = create<UpstashStore>()(
  devtools(
    immer<UpstashStore>((set, get) => ({
      // 初始状态
      isConnected: false,
      isChecking: false,
      lastCheckedAt: null,
      isSyncing: false,
      lastSyncedAt: null,
      isEnabled: true, // 默认启用
      userId: generateUserId(),

      // 检查连接状态
      checkConnection: async () => {
        set(state => {
          state.isChecking = true
        })

        try {
          const connected = await checkDatabaseConnection()
          set(state => {
            state.isConnected = connected
            state.isChecking = false
            state.lastCheckedAt = Date.now()
          })
          return connected
        } catch {
          set(state => {
            state.isConnected = false
            state.isChecking = false
            state.lastCheckedAt = Date.now()
          })
          return false
        }
      },

      // 启用/禁用数据库
      setEnabled: (enabled: boolean) => {
        set(state => {
          state.isEnabled = enabled
        })
      },

      // 从数据库同步数据
      syncFromCloud: async () => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return null
        }

        set(state => {
          state.isSyncing = true
        })

        try {
          const data = await syncFromDatabase(get().userId)
          set(state => {
            state.isSyncing = false
            state.lastSyncedAt = Date.now()
          })
          return data
        } catch (error) {
          set(state => {
            state.isSyncing = false
          })
          console.error('Sync from cloud failed:', error)
          return null
        }
      },

      // 同步数据到数据库
      syncToCloud: async data => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return false
        }

        set(state => {
          state.isSyncing = true
        })

        try {
          const success = await syncToDatabase(get().userId, data)
          set(state => {
            state.isSyncing = false
            state.lastSyncedAt = Date.now()
          })
          return success
        } catch (error) {
          set(state => {
            state.isSyncing = false
          })
          console.error('Sync to cloud failed:', error)
          return false
        }
      },

      // 保存视频源
      saveVideoSources: async sources => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return false
        }

        const success = await saveVideoSources(get().userId, sources)
        if (success) {
          set(state => {
            state.lastSyncedAt = Date.now()
          })
        }
        return success
      },

      // 保存观看历史
      saveViewingHistory: async history => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return false
        }

        const success = await saveViewingHistory(get().userId, history)
        if (success) {
          set(state => {
            state.lastSyncedAt = Date.now()
          })
        }
        return success
      },

      // 保存搜索历史
      saveSearchHistory: async history => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return false
        }

        const success = await saveSearchHistory(get().userId, history)
        if (success) {
          set(state => {
            state.lastSyncedAt = Date.now()
          })
        }
        return success
      },

      // 保存设置
      saveSettings: async settings => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return false
        }

        const success = await saveUserSettings(get().userId, settings)
        if (success) {
          set(state => {
            state.lastSyncedAt = Date.now()
          })
        }
        return success
      },

      // 保存搜索缓存
      saveSearchCache: async cache => {
        if (!get().isEnabled || !isUpstashConfigured()) {
          return false
        }

        const success = await saveSearchCache(get().userId, cache)
        if (success) {
          set(state => {
            state.lastSyncedAt = Date.now()
          })
        }
        return success
      },

      // 初始化
      initialize: () => {
        // 检查是否配置了 Upstash
        if (isUpstashConfigured()) {
          // 自动检查连接状态
          get().checkConnection()
        } else {
          set(state => {
            state.isConnected = false
            state.isEnabled = false
          })
        }
      },
    })),
    {
      name: 'UpstashStore',
    },
  ),
)
