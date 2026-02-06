import { Redis } from '@upstash/redis'
import type { VideoApi, ViewingHistoryItem } from '@/types'
import type { SearchHistoryItem } from '@/types'

// 数据库配置
const UPSTASH_REDIS_REST_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

// 键名前缀
const KEY_PREFIX = 'ouonnki-tv:'

// 检查是否配置了 Upstash
export const isUpstashConfigured = (): boolean => {
  const configured = !!UPSTASH_REDIS_REST_URL && !!UPSTASH_REDIS_REST_TOKEN
  console.log('[DB] Upstash 配置检查:', {
    configured,
    hasUrl: !!UPSTASH_REDIS_REST_URL,
    hasToken: !!UPSTASH_REDIS_REST_TOKEN,
    url: UPSTASH_REDIS_REST_URL?.substring(0, 20) + '...',
  })
  return configured
}

// 单例 Redis 客户端
let redisClient: Redis | null = null

export const getRedisClient = (): Redis | null => {
  if (!isUpstashConfigured()) {
    console.error('[DB] Upstash 未配置，无法创建 Redis 客户端')
    return null
  }

  if (!redisClient) {
    try {
      redisClient = new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
      })
      console.log('[DB] Redis 客户端已创建')
    } catch (error) {
      console.error('[DB] 创建 Redis 客户端失败:', error)
      return null
    }
  }

  return redisClient
}

// 生成用户特定的键
export const userKey = (userId: string, key: string): string => `${KEY_PREFIX}u:${userId}:${key}`

// 重试包装器
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (err: unknown) {
      const error = err as Error
      const isLastAttempt = i === maxRetries - 1
      const isConnectionError =
        error.message?.includes('Connection') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND') ||
        (error as { code?: string }).code === 'ECONNRESET' ||
        (error as { code?: string }).code === 'EPIPE'

      if (isConnectionError && !isLastAttempt) {
        console.log(`[DB] 操作失败，重试中... (${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }

      throw err
    }
  }

  throw new Error('达到最大重试次数')
}

// ==================== 播放记录 ====================
export const savePlayRecord = async (
  userId: string,
  key: string,
  record: ViewingHistoryItem
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    await withRetry(() => redis.set(userKey(userId, `pr:${key}`), record))
    console.log('[DB] 播放记录已保存:', key)
    return true
  } catch (error) {
    console.error('[DB] 保存播放记录失败:', error)
    return false
  }
}

export const getPlayRecord = async (
  userId: string,
  key: string
): Promise<ViewingHistoryItem | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const data = await withRetry(() => redis.get(userKey(userId, `pr:${key}`)))
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as ViewingHistoryItem
  } catch (error) {
    console.error('[DB] 获取播放记录失败:', error)
    return null
  }
}

export const getAllPlayRecords = async (userId: string): Promise<ViewingHistoryItem[]> => {
  try {
    const redis = getRedisClient()
    if (!redis) return []

    const pattern = userKey(userId, 'pr:*')
    const keys: string[] = await withRetry(() => redis.keys(pattern))
    if (keys.length === 0) return []

    const values = await withRetry(() => redis.mget<unknown[]>(...keys))

    const records: ViewingHistoryItem[] = []
    values.forEach((value) => {
      if (value) {
        const record = (typeof value === 'string' ? JSON.parse(value) : value) as ViewingHistoryItem
        records.push(record)
      }
    })

    // 按时间排序
    return records.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('[DB] 获取所有播放记录失败:', error)
    return []
  }
}

export const deletePlayRecord = async (userId: string, key: string): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    await withRetry(() => redis.del(userKey(userId, `pr:${key}`)))
    console.log('[DB] 播放记录已删除:', key)
    return true
  } catch (error) {
    console.error('[DB] 删除播放记录失败:', error)
    return false
  }
}

// ==================== 搜索历史 ====================
const SEARCH_HISTORY_LIMIT = 50

export const addSearchHistory = async (
  userId: string,
  item: SearchHistoryItem
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    const key = userKey(userId, 'search:history')

    // 获取现有历史
    const existing = await withRetry(() => redis.get<SearchHistoryItem[]>(key))
    let history: SearchHistoryItem[] = existing || []

    // 去重：如果已存在相同内容，先删除旧的
    history = history.filter(h => h.content !== item.content)

    // 添加到开头
    history.unshift(item)

    // 限制数量
    if (history.length > SEARCH_HISTORY_LIMIT) {
      history = history.slice(0, SEARCH_HISTORY_LIMIT)
    }

    await withRetry(() => redis.set(key, history))
    console.log('[DB] 搜索历史已更新:', item.content)
    return true
  } catch (error) {
    console.error('[DB] 保存搜索历史失败:', error)
    return false
  }
}

export const getSearchHistory = async (userId: string): Promise<SearchHistoryItem[]> => {
  try {
    const redis = getRedisClient()
    if (!redis) return []

    const data = await withRetry(() => redis.get<SearchHistoryItem[]>(userKey(userId, 'search:history')))
    return data || []
  } catch (error) {
    console.error('[DB] 获取搜索历史失败:', error)
    return []
  }
}

export const clearSearchHistory = async (userId: string): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    await withRetry(() => redis.del(userKey(userId, 'search:history')))
    console.log('[DB] 搜索历史已清空')
    return true
  } catch (error) {
    console.error('[DB] 清空搜索历史失败:', error)
    return false
  }
}

// ==================== 视频源 ====================
export const saveVideoSources = async (
  userId: string,
  sources: VideoApi[]
): Promise<boolean> => {
  try {
    console.log('[DB] 开始保存视频源:', { userId, count: sources.length })
    const redis = getRedisClient()
    if (!redis) {
      console.error('[DB] Redis 客户端未创建')
      return false
    }

    const key = userKey(userId, 'sources')
    console.log('[DB] 保存到键:', key)
    
    await withRetry(() => redis.set(key, sources))
    console.log('[DB] 视频源已保存:', sources.length, '个')
    return true
  } catch (error) {
    console.error('[DB] 保存视频源失败:', error)
    return false
  }
}

export const getVideoSources = async (userId: string): Promise<VideoApi[] | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const data = await withRetry(() => redis.get(userKey(userId, 'sources')))
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as VideoApi[]
  } catch (error) {
    console.error('[DB] 获取视频源失败:', error)
    return null
  }
}

// ==================== 用户设置 ====================
export const saveUserSettings = async (
  userId: string,
  settings: Record<string, unknown>
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis) return false

    await withRetry(() => redis.set(userKey(userId, 'settings'), settings))
    console.log('[DB] 用户设置已保存')
    return true
  } catch (error) {
    console.error('[DB] 保存用户设置失败:', error)
    return false
  }
}

export const getUserSettings = async (userId: string): Promise<Record<string, unknown> | null> => {
  try {
    const redis = getRedisClient()
    if (!redis) return null

    const data = await withRetry(() => redis.get(userKey(userId, 'settings')))
    if (!data) return null

    return (typeof data === 'string' ? JSON.parse(data) : data) as Record<string, unknown>
  } catch (error) {
    console.error('[DB] 获取用户设置失败:', error)
    return null
  }
}

// ==================== 检查连接 ====================
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('[DB] 开始检查数据库连接...')
    const redis = getRedisClient()
    if (!redis) {
      console.error('[DB] Redis 客户端未创建')
      return false
    }

    console.log('[DB] 发送 PING 命令...')
    const result = await withRetry(() => redis.ping())
    console.log('[DB] PING 结果:', result)
    
    // Upstash Redis 的 ping() 可能返回 'PONG' 或 []
    const isConnected = result === 'PONG' || result === '[]' || (Array.isArray(result) && result.length === 0)
    console.log('[DB] 连接状态:', isConnected)
    return isConnected
  } catch (error) {
    console.error('[DB] 连接检查失败:', error)
    if (error instanceof Error) {
      console.error('[DB] 错误详情:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      })
    }
    return false
  }
}

// ==================== 批量操作 ====================
export const batchSavePlayRecords = async (
  userId: string,
  records: { key: string; record: ViewingHistoryItem }[]
): Promise<boolean> => {
  try {
    const redis = getRedisClient()
    if (!redis || records.length === 0) return false

    const pipeline = redis.pipeline()
    records.forEach(({ key, record }) => {
      pipeline.set(userKey(userId, `pr:${key}`), record)
    })

    await withRetry(() => pipeline.exec())
    console.log('[DB] 批量保存播放记录:', records.length, '条')
    return true
  } catch (error) {
    console.error('[DB] 批量保存播放记录失败:', error)
    return false
  }
}
