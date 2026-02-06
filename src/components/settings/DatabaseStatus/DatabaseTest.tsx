import { useState } from 'react'
import { useUpstashStore } from '@/store/upstashStore'
import { getRedisClient } from '@/services/upstash.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, TestTube, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function DatabaseTest() {
  const { isConnected, isEnabled } = useUpstashStore()
  const [testKey, setTestKey] = useState('test-key')
  const [testValue, setTestValue] = useState('Hello Upstash!')
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    write: boolean | null
    read: boolean | null
    delete: boolean | null
  }>({ write: null, read: null, delete: null })

  const runTest = async () => {
    if (!isConnected || !isEnabled) {
      toast.error('数据库未连接或未启用')
      return
    }

    setLoading(true)
    setTestResult({ write: null, read: null, delete: null })

    const redis = getRedisClient()
    if (!redis) {
      toast.error('Redis 客户端未初始化')
      setLoading(false)
      return
    }

    try {
      // 1. 测试写入
      const key = `ouonnki-tv:test:${testKey}`
      const value = {
        message: testValue,
        timestamp: Date.now(),
        test: true,
      }

      await redis.set(key, JSON.stringify(value))
      setTestResult(prev => ({ ...prev, write: true }))
      toast.success('✅ 写入测试成功')

      // 2. 测试读取
      const readData = await redis.get(key)
      if (readData) {
        // Upstash 会自动解析 JSON，所以 readData 可能已经是对象
        const parsed = typeof readData === 'string' ? JSON.parse(readData) : readData
        console.log('读取的数据:', parsed)
        setTestResult(prev => ({ ...prev, read: true }))
        toast.success('✅ 读取测试成功')
      } else {
        setTestResult(prev => ({ ...prev, read: false }))
        toast.error('❌ 读取测试失败：数据不存在')
      }

      // 3. 测试删除
      await redis.del(key)
      const checkDeleted = await redis.get(key)
      if (!checkDeleted) {
        setTestResult(prev => ({ ...prev, delete: true }))
        toast.success('✅ 删除测试成功')
      } else {
        setTestResult(prev => ({ ...prev, delete: false }))
        toast.error('❌ 删除测试失败：数据仍存在')
      }
    } catch (error) {
      console.error('测试失败:', error)
      toast.error(`测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const clearTestResults = () => {
    setTestResult({ write: null, read: null, delete: null })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white/40 p-6 dark:border-gray-700 dark:bg-gray-800/40">
      <div className="mb-4 flex items-center gap-2">
        <TestTube className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-gray-800 dark:text-gray-100">数据库功能测试</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              测试键名
            </label>
            <Input
              value={testKey}
              onChange={e => setTestKey(e.target.value)}
              placeholder="输入测试键名"
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-400">
              测试值
            </label>
            <Input
              value={testValue}
              onChange={e => setTestValue(e.target.value)}
              placeholder="输入测试值"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={runTest}
            disabled={loading || !isConnected || !isEnabled}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            运行测试
          </Button>
          <Button
            variant="outline"
            onClick={clearTestResults}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            清除结果
          </Button>
        </div>

        {/* 测试结果 */}
        {(testResult.write !== null || testResult.read !== null || testResult.delete !== null) && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              测试结果
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {testResult.write === true ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : testResult.write === false ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  写入操作 {testResult.write === true ? '成功' : testResult.write === false ? '失败' : '等待中...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {testResult.read === true ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : testResult.read === false ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  读取操作 {testResult.read === true ? '成功' : testResult.read === false ? '失败' : '等待中...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {testResult.delete === true ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : testResult.delete === false ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  删除操作 {testResult.delete === true ? '成功' : testResult.delete === false ? '失败' : '等待中...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ 数据库未连接，请先检查连接状态
            </p>
          </div>
        )}

        {isConnected && !isEnabled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ 云端同步未启用，请先启用云端同步
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
