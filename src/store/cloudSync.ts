import { useApiStore } from './apiStore'
import { useViewingHistoryStore } from './viewingHistoryStore'
import { useSearchStore } from './searchStore'
import { useSettingStore } from './settingStore'
import {
  isUpstashConfigured,
  checkDatabaseConnection,
  getVideoSources,
  saveVideoSources,
  getAllPlayRecords,
  getSearchHistory,
  getUserSettings,
  saveUserSettings,
  batchSavePlayRecords,
  userKey,
  getRedisClient,
} from '@/services/db.service'
import { toast } from 'sonner'
import type { VideoApi, ViewingHistoryItem } from '@/types'
import type { SearchHistoryItem } from '@/types'

// 生成用户 ID
const generateUserId = (): string => {
  const username = import.meta.env.VITE_USERNAME || ''
  const accessPassword = import.meta.env.VITE_ACCESS_PASSWORD || ''

  // 如果有用户名或访问密码，生成固定的用户 ID
  if (username || accessPassword) {
    const combinedString = `${username}:${accessPassword}`
    let hash = 0
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    const userId = `user_${Math.abs(hash).toString(16)}`
    console.log('[CloudSync] 基于用户名和密码生成用户 ID:', {
      username,
      hasPassword: !!accessPassword,
      userId,
    })
    return userId
  }

  // 否则使用随机生成的用户 ID
  let userId = localStorage.getItem('ouonnki-tv-user-id')
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('ouonnki-tv-user-id', userId)
    console.log('[CloudSync] 生成随机用户 ID:', userId)
  }
  return userId
}

// 防抖函数
function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: unknown[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

class CloudSync {
  private userId: string
  private isEnabled = false
  private isConnected = false
  private unsubscribeFns: (() => void)[] = []

  constructor() {
    this.userId = generateUserId()
    console.log('[CloudSync] 用户ID:', this.userId)
  }

  // 初始化
  async initialize() {
    console.log('[CloudSync] 初始化...')

    if (!isUpstashConfigured()) {
      console.log('[CloudSync] Upstash 未配置，跳过云端同步')
      return false
    }

    // 检查连接
    this.isConnected = await checkDatabaseConnection()
    console.log('[CloudSync] 连接状态:', this.isConnected)

    if (!this.isConnected) {
      toast.error('无法连接到云端数据库')
      return false
    }

    this.isEnabled = true

    // 从云端恢复数据
    await this.pullFromCloud()

    // 启动监听
    this.startListening()

    // 只在首次连接时显示提示
    const hasShownConnectionToast = localStorage.getItem('ouonnki-tv-connection-toast-shown')
    if (!hasShownConnectionToast) {
      toast.success('已连接到云端数据库')
      localStorage.setItem('ouonnki-tv-connection-toast-shown', 'true')
    }
    return true
  }

  // 从云端拉取数据
  async pullFromCloud() {
    if (!this.isEnabled || !this.isConnected) {
      console.log('[CloudSync] 云端同步未启用，跳过拉取')
      return
    }

    console.log('[CloudSync] 从云端拉取数据...')

    try {
      // 恢复视频源
      const sources = await getVideoSources(this.userId)
      if (sources && sources.length > 0) {
        const localSources = useApiStore.getState().videoAPIs
        // 合并：以云端为准，但保留本地特有的源
        const cloudIds = new Set(sources.map(s => s.id))
        const localOnly = localSources.filter(s => !cloudIds.has(s.id))
        const merged = [...sources, ...localOnly]
        useApiStore.setState({ videoAPIs: merged })
        console.log('[CloudSync] 已恢复视频源:', sources.length, '个')
      }

      // 恢复播放记录
      const records = await getAllPlayRecords(this.userId)
      if (records && records.length > 0) {
        useViewingHistoryStore.setState({ viewingHistory: records })
        console.log('[CloudSync] 已恢复播放记录:', records.length, '条')
      }

      // 恢复搜索历史
      const searchHistory = await getSearchHistory(this.userId)
      if (searchHistory && searchHistory.length > 0) {
        useSearchStore.setState({ searchHistory })
        console.log('[CloudSync] 已恢复搜索历史:', searchHistory.length, '条')
      }

      // 恢复设置
      const settings = await getUserSettings(this.userId)
      if (settings) {
        const s = settings as {
          network?: { defaultTimeout: number; defaultRetry: number }
          search?: { maxHistory: number; cacheExpiry: number; isSearchHistoryEnabled: boolean; isSearchHistoryVisible: boolean; searchCacheExpiryHours: number }
          playback?: { autoPlay: boolean; skipIntro: boolean; isViewingHistoryEnabled: boolean; isViewingHistoryVisible: boolean; isAutoPlayEnabled: boolean; defaultEpisodeOrder: 'asc' | 'desc'; adFilteringEnabled: boolean }
          system?: { theme: string; language: string; isUpdateLogEnabled: boolean }
        }
        if (s.network) useSettingStore.setState({ network: s.network })
        if (s.search) useSettingStore.setState({ search: s.search })
        if (s.playback) useSettingStore.setState({ playback: s.playback })
        if (s.system) useSettingStore.setState({ system: s.system })
        console.log('[CloudSync] 已恢复设置')
      }

      console.log('[CloudSync] 数据拉取完成')
    } catch (error) {
      console.error('[CloudSync] 拉取数据失败:', error)
    }
  }

  // 启动监听
  private startListening() {
    console.log('[CloudSync] 启动数据监听...')

    // 监听视频源变化
    const unsubscribeSources = useApiStore.subscribe(
      debounce((state: unknown) => {
        if (!this.isEnabled) return
        const s = state as { videoAPIs: VideoApi[] }
        console.log('[CloudSync] 视频源变化，同步到云端...')
        saveVideoSources(this.userId, s.videoAPIs)
      }, 2000)
    )
    this.unsubscribeFns.push(unsubscribeSources)

    // 监听播放记录变化
    const unsubscribeHistory = useViewingHistoryStore.subscribe(
      debounce((state: unknown) => {
        if (!this.isEnabled) return
        const s = state as { viewingHistory: ViewingHistoryItem[] }
        console.log('[CloudSync] 播放记录变化，同步到云端...')
        // 批量保存最新的10条
        const recent = s.viewingHistory.slice(0, 10)
        const records = recent.map(item => ({
          key: `${item.sourceCode}_${item.vodId}`,
          record: item,
        }))
        batchSavePlayRecords(this.userId, records)
      }, 5000)
    )
    this.unsubscribeFns.push(unsubscribeHistory)

    // 监听搜索历史变化
    const unsubscribeSearch = useSearchStore.subscribe(
      debounce((state: unknown) => {
        if (!this.isEnabled) return
        const s = state as { searchHistory: SearchHistoryItem[] }
        console.log('[CloudSync] 搜索历史变化，同步到云端...')
        // 保存整个搜索历史
        const key = userKey(this.userId, 'search:history')
        const redis = getRedisClient()
        if (redis) {
          redis.set(key, s.searchHistory)
        }
      }, 3000)
    )
    this.unsubscribeFns.push(unsubscribeSearch)

    // 监听设置变化
    const unsubscribeSettings = useSettingStore.subscribe(
      debounce((state: unknown) => {
        if (!this.isEnabled) return
        const s = state as {
          network: { defaultTimeout: number; defaultRetry: number }
          search: { maxHistory: number; cacheExpiry: number; isSearchHistoryEnabled: boolean; isSearchHistoryVisible: boolean; searchCacheExpiryHours: number }
          playback: { autoPlay: boolean; skipIntro: boolean; isViewingHistoryEnabled: boolean; isViewingHistoryVisible: boolean; isAutoPlayEnabled: boolean; defaultEpisodeOrder: 'asc' | 'desc'; adFilteringEnabled: boolean }
          system: { theme: string; language: string; isUpdateLogEnabled: boolean }
        }
        console.log('[CloudSync] 设置变化，同步到云端...')
        saveUserSettings(this.userId, {
          network: s.network,
          search: s.search,
          playback: s.playback,
          system: s.system,
        })
      }, 5000)
    )
    this.unsubscribeFns.push(unsubscribeSettings)

    console.log('[CloudSync] 数据监听已启动')
  }

  // 手动同步到云端
  async pushToCloud() {
    if (!this.isEnabled || !this.isConnected) {
      toast.error('云端同步未启用')
      return false
    }

    console.log('[CloudSync] 手动同步到云端...')

    try {
      // 同步视频源
      const sources = useApiStore.getState().videoAPIs
      await saveVideoSources(this.userId, sources)

      // 同步播放记录
      const records = useViewingHistoryStore.getState().viewingHistory.slice(0, 50)
      const batchRecords = records.map(item => ({
        key: `${item.sourceCode}_${item.vodId}`,
        record: item,
      }))
      await batchSavePlayRecords(this.userId, batchRecords)

      // 同步搜索历史
      const searchHistory = useSearchStore.getState().searchHistory
      const key = userKey(this.userId, 'search:history')
      const redis = getRedisClient()
      if (redis) {
        await redis.set(key, searchHistory)
      }

      // 同步设置
      const settings = useSettingStore.getState()
      await saveUserSettings(this.userId, {
        network: settings.network,
        search: settings.search,
        playback: settings.playback,
        system: settings.system,
      })

      toast.success('已同步到云端')
      return true
    } catch (error) {
      console.error('[CloudSync] 同步失败:', error)
      toast.error('同步到云端失败')
      return false
    }
  }

  // 获取状态
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isConnected: this.isConnected,
      userId: this.userId,
    }
  }

  // 销毁
  destroy() {
    console.log('[CloudSync] 销毁...')
    this.unsubscribeFns.forEach(fn => fn())
    this.unsubscribeFns = []
  }
}

// 单例实例
let cloudSyncInstance: CloudSync | null = null

export const getCloudSync = (): CloudSync => {
  if (!cloudSyncInstance) {
    cloudSyncInstance = new CloudSync()
  }
  return cloudSyncInstance
}

export const initializeCloudSync = async (): Promise<boolean> => {
  const sync = getCloudSync()
  return sync.initialize()
}

export const pushToCloud = async (): Promise<boolean> => {
  const sync = getCloudSync()
  return sync.pushToCloud()
}

export const pullFromCloud = async (): Promise<void> => {
  const sync = getCloudSync()
  return sync.pullFromCloud()
}
