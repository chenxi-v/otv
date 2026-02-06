import { useApiStore } from './apiStore'
import { useViewingHistoryStore } from './viewingHistoryStore'
import { useSearchStore } from './searchStore'
import { useSettingStore } from './settingStore'
import { useUpstashStore } from './upstashStore'
import { isUpstashConfigured } from '@/services/upstash.service'
import { toast } from 'sonner'
import type { VideoApi, ViewingHistoryItem } from '@/types'
import type { SearchHistoryItem } from '@/types'

// 防抖函数
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 同步管理器
class SyncManager {
  private unsubscribeFns: (() => void)[] = []
  private isInitialized = false

  // 初始化同步监听
  initialize() {
    if (this.isInitialized) {
      console.log('[SyncManager] 同步管理器已经初始化，跳过')
      return
    }
    this.isInitialized = true
    
    console.log('[SyncManager] 开始初始化同步监听...')

    // 监听视频源变化
    console.log('[SyncManager] 注册视频源监听...')
    const unsubscribeVideoAPIs = useApiStore.subscribe(
      debounce((state: unknown) => {
        const s = state as { videoAPIs: VideoApi[] }
        const upstashStore = useUpstashStore.getState()
        console.log('[SyncManager] 视频源变化 detected, 配置状态:', {
          configured: isUpstashConfigured(),
          enabled: upstashStore.isEnabled,
          connected: upstashStore.isConnected
        })
        if (isUpstashConfigured() && upstashStore.isEnabled && upstashStore.isConnected) {
          console.log('[SyncManager] 同步视频源到云端...')
          upstashStore.saveVideoSources(s.videoAPIs).then(success => {
            if (success) {
              console.log('[SyncManager] 视频源同步成功')
            } else {
              console.error('[SyncManager] 视频源同步失败')
            }
          })
        }
      }, 1000)
    )
    this.unsubscribeFns.push(unsubscribeVideoAPIs)

    // 监听观看历史变化
    const unsubscribeViewingHistory = useViewingHistoryStore.subscribe(
      debounce((state: unknown) => {
        const s = state as { viewingHistory: ViewingHistoryItem[] }
        const upstashStore = useUpstashStore.getState()
        if (isUpstashConfigured() && upstashStore.isEnabled && upstashStore.isConnected) {
          console.log('[SyncManager] 同步观看历史到云端...')
          upstashStore.saveViewingHistory(s.viewingHistory).then(success => {
            if (success) {
              console.log('[SyncManager] 观看历史同步成功')
            } else {
              console.error('[SyncManager] 观看历史同步失败')
            }
          })
        }
      }, 1000)
    )
    this.unsubscribeFns.push(unsubscribeViewingHistory)

    // 监听搜索历史变化
    const unsubscribeSearchHistory = useSearchStore.subscribe(
      debounce((state: unknown) => {
        const s = state as { searchHistory: SearchHistoryItem[] }
        const upstashStore = useUpstashStore.getState()
        if (isUpstashConfigured() && upstashStore.isEnabled && upstashStore.isConnected) {
          console.log('[SyncManager] 同步搜索历史到云端...')
          upstashStore.saveSearchHistory(s.searchHistory).then(success => {
            if (success) {
              console.log('[SyncManager] 搜索历史同步成功')
            } else {
              console.error('[SyncManager] 搜索历史同步失败')
            }
          })
        }
      }, 1000)
    )
    this.unsubscribeFns.push(unsubscribeSearchHistory)

    // 监听设置变化
    const unsubscribeSettings = useSettingStore.subscribe(
      debounce((state: unknown) => {
        const s = state as { 
          network: { defaultTimeout: number; defaultRetry: number }
          search: { maxHistory: number; cacheExpiry: number; isSearchHistoryEnabled: boolean; isSearchHistoryVisible: boolean; searchCacheExpiryHours: number }
          playback: { autoPlay: boolean; skipIntro: boolean; isViewingHistoryEnabled: boolean; isViewingHistoryVisible: boolean; isAutoPlayEnabled: boolean; defaultEpisodeOrder: 'asc' | 'desc'; adFilteringEnabled: boolean }
          system: { theme: string; language: string; isUpdateLogEnabled: boolean }
        }
        const upstashStore = useUpstashStore.getState()
        if (isUpstashConfigured() && upstashStore.isEnabled && upstashStore.isConnected) {
          console.log('[SyncManager] 同步设置到云端...')
          upstashStore.saveSettings({
            network: s.network,
            search: s.search,
            playback: s.playback,
            system: s.system,
          }).then(success => {
            if (success) {
              console.log('[SyncManager] 设置同步成功')
            } else {
              console.error('[SyncManager] 设置同步失败')
            }
          })
        }
      }, 1000)
    )
    this.unsubscribeFns.push(unsubscribeSettings)

    console.log('[SyncManager] 同步管理器已初始化')
  }

  // 从云端恢复数据
  async restoreFromCloud() {
    const upstashStore = useUpstashStore.getState()
    
    if (!isUpstashConfigured() || !upstashStore.isEnabled) {
      console.log('[SyncManager] 云端同步未启用，跳过恢复')
      return false
    }

    if (!upstashStore.isConnected) {
      console.log('[SyncManager] 未连接到云端，尝试连接...')
      const connected = await upstashStore.checkConnection()
      if (!connected) {
        toast.error('无法连接到云端数据库')
        return false
      }
    }

    console.log('[SyncManager] 从云端恢复数据...')
    const data = await upstashStore.syncFromCloud()
    
    if (!data) {
      toast.error('从云端恢复数据失败')
      return false
    }

    // 恢复视频源
    if (data.videoSources && data.videoSources.length > 0) {
      useApiStore.setState({ videoAPIs: data.videoSources })
      console.log('[SyncManager] 已恢复视频源:', data.videoSources.length, '个')
    }

    // 恢复观看历史
    if (data.viewingHistory && data.viewingHistory.length > 0) {
      useViewingHistoryStore.setState({ viewingHistory: data.viewingHistory })
      console.log('[SyncManager] 已恢复观看历史:', data.viewingHistory.length, '条')
    }

    // 恢复搜索历史
    if (data.searchHistory && data.searchHistory.length > 0) {
      useSearchStore.setState({ searchHistory: data.searchHistory })
      console.log('[SyncManager] 已恢复搜索历史:', data.searchHistory.length, '条')
    }

    // 恢复设置
    if (data.settings) {
      const settings = data.settings as {
        network?: { defaultTimeout: number; defaultRetry: number }
        search?: { maxHistory: number; cacheExpiry: number; isSearchHistoryEnabled: boolean; isSearchHistoryVisible: boolean; searchCacheExpiryHours: number }
        playback?: { autoPlay: boolean; skipIntro: boolean; isViewingHistoryEnabled: boolean; isViewingHistoryVisible: boolean; isAutoPlayEnabled: boolean; defaultEpisodeOrder: 'asc' | 'desc'; adFilteringEnabled: boolean }
        system?: { theme: string; language: string; isUpdateLogEnabled: boolean }
      }
      if (settings.network) useSettingStore.setState({ network: settings.network })
      if (settings.search) useSettingStore.setState({ search: settings.search })
      if (settings.playback) useSettingStore.setState({ playback: settings.playback })
      if (settings.system) useSettingStore.setState({ system: settings.system })
      console.log('[SyncManager] 已恢复设置')
    }

    toast.success('已从云端恢复数据')
    return true
  }

  // 清理监听
  destroy() {
    this.unsubscribeFns.forEach(fn => fn())
    this.unsubscribeFns = []
    this.isInitialized = false
    console.log('[SyncManager] 同步管理器已销毁')
  }
}

// 单例实例
let syncManagerInstance: SyncManager | null = null

export const getSyncManager = (): SyncManager => {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager()
  }
  return syncManagerInstance
}

export const initializeSyncManager = () => {
  const manager = getSyncManager()
  manager.initialize()
  return manager
}

export const restoreFromCloud = async () => {
  const manager = getSyncManager()
  return manager.restoreFromCloud()
}
