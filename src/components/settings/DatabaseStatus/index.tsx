import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cloud,
  CloudOff,
  AlertCircle,
  Loader2,
  Activity,
  Clock,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  isUpstashConfigured,
  checkDatabaseConnection,
} from '@/services/db.service'
import { getCloudSync, initializeCloudSync } from '@/store/cloudSync'

export default function DatabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    setIsConfigured(isUpstashConfigured())
    if (isUpstashConfigured()) {
      initializeCloudSync().then(success => {
        console.log('[DatabaseStatus] CloudSync 初始化结果:', success)
        setIsInitialized(success)
        if (success) {
          updateStatus()
          checkConnection()
          startMonitoring()
        }
      })
    }
  }, [])

  const updateStatus = () => {
    const sync = getCloudSync()
    const status = sync.getStatus()
    console.log('[DatabaseStatus] CloudSync 状态:', status)
    setIsEnabled(status.isEnabled)
    setIsConnected(status.isConnected)
    setLastSyncedAt(Date.now())
    setUsername(import.meta.env.VITE_USERNAME || '')
    setUserId(status.userId)
  }

  const startMonitoring = () => {
    setInterval(() => {
      checkConnection()
      if (isInitialized) {
        updateStatus()
      }
    }, 30000)
  }

  const checkConnection = async () => {
    if (!isUpstashConfigured()) {
      setIsConnected(false)
      setIsEnabled(false)
      return
    }

    setIsChecking(true)
    try {
      const connected = await checkDatabaseConnection()
      setIsConnected(connected)
      setLastCheckedAt(Date.now())

      if (connected && isInitialized) {
        updateStatus()
      }
    } catch (error) {
      console.error('检查连接失败:', error)
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleCheckConnection = async () => {
    await checkConnection()
    if (isConnected) {
      toast.success('数据库连接成功')
    } else {
      toast.error('数据库连接失败，请检查配置')
    }
  }

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '从未'
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return `${seconds} 秒前`
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  const getConnectionStatusColor = () => {
    if (isChecking) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
    if (isConnected) return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  }

  const getConnectionStatusText = () => {
    if (isChecking) return '正在检查...'
    if (isConnected) return '已连接'
    return '未连接'
  }

  const getConnectionStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-6 w-6 animate-spin" />
    if (isConnected) return <Cloud className="h-6 w-6" />
    return <CloudOff className="h-6 w-6" />
  }

  if (!isConfigured) {
    return (
      <div className="flex flex-col gap-6 px-4 md:px-8">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <Database className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">数据库状态</h2>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-2">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">未配置数据库</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                当前未配置 Upstash Redis 数据库。数据将仅保存在本地浏览器中。
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                如需启用云端同步，请在环境变量中配置：
              </p>
              <ul className="ml-4 list-disc text-sm text-amber-700 dark:text-amber-300">
                <li>VITE_UPSTASH_REDIS_REST_URL</li>
                <li>VITE_UPSTASH_REDIS_REST_TOKEN</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 md:px-8">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
        <Database className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">数据库状态</h2>
      </div>

      {/* 实时连接状态 */}
      <div className="rounded-lg border border-gray-200 bg-white/40 p-6 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-100">
                  {getConnectionStatusText()}
                </h3>
                <p className="text-sm text-gray-500">
                  {isChecking ? '正在检查连接...' : `上次检查: ${formatTime(lastCheckedAt)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </div>

          {/* 详细状态信息 */}
          <div className="grid gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            {username && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span>用户名</span>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {username}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Database className="h-4 w-4" />
                <span>用户 ID</span>
              </div>
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {userId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Activity className="h-4 w-4" />
                <span>同步状态</span>
              </div>
              <span className={`text-sm font-medium ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                {isEnabled ? '已启用' : '未启用'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>上次同步</span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {formatTime(lastSyncedAt)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Database className="h-4 w-4" />
                <span>数据库配置</span>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                已配置
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={handleCheckConnection}
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          检查连接
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            const sync = getCloudSync()
            sync.pushToCloud()
          }}
          disabled={!isConnected || !isEnabled}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          手动同步
        </Button>
      </div>

      {/* 说明信息 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">数据同步说明</h4>
            <ul className="ml-4 list-disc text-sm text-blue-700 dark:text-blue-300">
              <li>连接状态每 30 秒自动更新一次</li>
              <li>视频源列表、观看历史、搜索历史等数据会自动同步到云端</li>
              <li>即使更换设备或清除浏览器数据，也能恢复您的个人配置</li>
              <li>数据存储在 Upstash Redis 中，安全可靠</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
