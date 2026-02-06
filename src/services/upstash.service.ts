import { Redis } from '@upstash/redis'
import type { VideoApi, ViewingHistoryItem } from '@/types'
import type { SearchHistoryItem } from '@/types'

// 数据库连接配置
const UPSTASH_REDIS_REST_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

// 检查是否配置了 Upstash
export const isUpstashConfigured = (): boolean => {
  return !!UPSTASH_REDIS_REST_URL && !!UPSTASH_REDIS_REST_TOKEN
}

// 创建 Redis 客户端
let redisClient: Redis | null = null

export const getRedisClient = (): Redis | null => {
  if (!isUpstashConfigured()) {
    return null
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })
  }

  return redisClient
}

// 检查数据库连接状态
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) {
      return false
    }

    // 尝试执行一个简单的 ping 命令
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Upstash connection check failed:', error)
    return false
  }
}

// 键名前缀
const KEY_PREFIX = 'ouonnki-tv:'

// 生成用户特定的键
const getUserKey = (userId: string, key: string): string => {
  return `${KEY_PREFIX}${userId}:${key}`
}

// ==================== 视频源操作 ====================

// 保存视频源列表
export const saveVideoSources = async (userId: string, sources: VideoApi[]): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    const key = getUserKey(userId, 'video-sources')
    await redis.set(key, sources)
    return true
  } catch (error) {
    console.error('Failed to save video sources:', error)
    return false
  }
}

// 获取视频源列表
export const getVideoSources = async (userId: string): Promise<VideoApi[] | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const key = getUserKey(userId, 'video-sources')
    const data = await redis.get(key)
    if (!data) return null

    // Upstash 会自动解析 JSON，如果返回的是字符串则手动解析
    return (typeof data === 'string' ? JSON.parse(data) : data) as VideoApi[]
  } catch (error) {
    console.error('Failed to get video sources:', error)
    return null
  }
}

// ==================== 观看历史操作 ====================

// 保存观看历史
export const saveViewingHistory = async (
  userId: string,
  history: ViewingHistoryItem[],
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    const key = getUserKey(userId, 'viewing-history')
    await redis.set(key, history)
    return true
  } catch (error) {
    console.error('Failed to save viewing history:', error)
    return false
  }
}

// 获取观看历史
export const getViewingHistory = async (userId: string): Promise<ViewingHistoryItem[] | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const key = getUserKey(userId, 'viewing-history')
    const data = await redis.get(key)
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as ViewingHistoryItem[]
  } catch (error) {
    console.error('Failed to get viewing history:', error)
    return null
  }
}

// ==================== 搜索历史操作 ====================

// 保存搜索历史
export const saveSearchHistory = async (
  userId: string,
  history: SearchHistoryItem[],
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    const key = getUserKey(userId, 'search-history')
    await redis.set(key, history)
    return true
  } catch (error) {
    console.error('Failed to save search history:', error)
    return false
  }
}

// 获取搜索历史
export const getSearchHistory = async (userId: string): Promise<SearchHistoryItem[] | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const key = getUserKey(userId, 'search-history')
    const data = await redis.get(key)
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as SearchHistoryItem[]
  } catch (error) {
    console.error('Failed to get search history:', error)
    return null
  }
}

// ==================== 设置操作 ====================

// 保存用户设置
export const saveUserSettings = async (
  userId: string,
  settings: Record<string, unknown>,
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    const key = getUserKey(userId, 'settings')
    await redis.set(key, settings)
    return true
  } catch (error) {
    console.error('Failed to save user settings:', error)
    return false
  }
}

// 获取用户设置
export const getUserSettings = async (
  userId: string,
): Promise<Record<string, unknown> | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const key = getUserKey(userId, 'settings')
    const data = await redis.get(key)
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as Record<string, unknown>
  } catch (error) {
    console.error('Failed to get user settings:', error)
    return null
  }
}

// ==================== 搜索缓存操作 ====================

// 保存搜索缓存
export const saveSearchCache = async (
  userId: string,
  cache: Record<string, unknown>,
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    const key = getUserKey(userId, 'search-cache')
    await redis.set(key, cache)
    return true
  } catch (error) {
    console.error('Failed to save search cache:', error)
    return false
  }
}

// 获取搜索缓存
export const getSearchCache = async (
  userId: string,
): Promise<Record<string, unknown> | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const key = getUserKey(userId, 'search-cache')
    const data = await redis.get(key)
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as Record<string, unknown>
  } catch (error) {
    console.error('Failed to get search cache:', error)
    return null
  }
}

// ==================== 同步操作 ====================

// 从数据库同步所有数据到本地
export const syncFromDatabase = async (userId: string): Promise<{
  videoSources: VideoApi[] | null
  viewingHistory: ViewingHistoryItem[] | null
  searchHistory: SearchHistoryItem[] | null
  settings: Record<string, unknown> | null
  searchCache: Record<string, unknown> | null
}> => {
  const [videoSources, viewingHistory, searchHistory, settings, searchCache] = await Promise.all([
    getVideoSources(userId),
    getViewingHistory(userId),
    getSearchHistory(userId),
    getUserSettings(userId),
    getSearchCache(userId),
  ])

  return {
    videoSources,
    viewingHistory,
    searchHistory,
    settings,
    searchCache,
  }
}

// 将所有本地数据同步到数据库
export const syncToDatabase = async (
  userId: string,
  data: {
    videoSources?: VideoApi[]
    viewingHistory?: ViewingHistoryItem[]
    searchHistory?: SearchHistoryItem[]
    settings?: Record<string, unknown>
    searchCache?: Record<string, unknown>
  },
): Promise<boolean> => {
  try {
    const promises: Promise<boolean>[] = []

    if (data.videoSources !== undefined) {
      promises.push(saveVideoSources(userId, data.videoSources))
    }
    if (data.viewingHistory !== undefined) {
      promises.push(saveViewingHistory(userId, data.viewingHistory))
    }
    if (data.searchHistory !== undefined) {
      promises.push(saveSearchHistory(userId, data.searchHistory))
    }
    if (data.settings !== undefined) {
      promises.push(saveUserSettings(userId, data.settings))
    }
    if (data.searchCache !== undefined) {
      promises.push(saveSearchCache(userId, data.searchCache))
    }

    const results = await Promise.all(promises)
    return results.every(r => r)
  } catch (error) {
    console.error('Failed to sync to database:', error)
    return false
  }
}
