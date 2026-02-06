import { Redis } from '@upstash/redis'

const UPSTASH_REDIS_REST_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

console.log('[Test] 环境变量:', {
  hasUrl: !!UPSTASH_REDIS_REST_URL,
  hasToken: !!UPSTASH_REDIS_REST_TOKEN,
  url: UPSTASH_REDIS_REST_URL,
  tokenPrefix: UPSTASH_REDIS_REST_TOKEN?.substring(0, 10) + '...',
})

async function testConnection() {
  try {
    console.log('[Test] 创建 Redis 客户端...')
    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })

    console.log('[Test] 发送 PING 命令...')
    const result = await redis.ping()
    console.log('[Test] PING 结果:', result)

    if (result === 'PONG') {
      console.log('[Test] 连接成功！')

      console.log('[Test] 测试 SET 命令...')
      await redis.set('test-key', 'test-value')
      console.log('[Test] SET 成功')

      console.log('[Test] 测试 GET 命令...')
      const value = await redis.get('test-key')
      console.log('[Test] GET 结果:', value)

      console.log('[Test] 测试 DEL 命令...')
      await redis.del('test-key')
      console.log('[Test] DEL 成功')
    }
  } catch (error) {
    console.error('[Test] 连接失败:', error)
    if (error instanceof Error) {
      console.error('[Test] 错误详情:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      })
    }
  }
}

testConnection()
