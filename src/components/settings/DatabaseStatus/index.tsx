import { useEffect, useState } from 'react'
import { useUpstashStore } from '@/store/upstashStore'
import { isUpstashConfigured } from '@/services/upstash.service'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
} from 'lucide-react'
import { toast } from 'sonner'
import DatabaseTest from './DatabaseTest'

export default function DatabaseStatus() {
  const {
    isConnected,
    isChecking,
    isSyncing,
    isEnabled,
    lastCheckedAt,
    lastSyncedAt,
    checkConnection,
    setEnabled,
    syncFromCloud,
    syncToCloud,
    initialize,
  } = useUpstashStore()

  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    setIsConfigured(isUpstashConfigured())
    initialize()
  }, [initialize])

  const handleCheckConnection = async () => {
    const connected = await checkConnection()
    if (connected) {
      toast.success('数据库连接成功')
    } else {
      toast.error('数据库连接失败，请检查配置')
    }
  }

  const handleSyncFromCloud = async () => {
    const data = await syncFromCloud()
    if (data) {
      toast.success('已从云端同步数据')
    } else {
      toast.error('同步失败，请检查连接状态')
    }
  }

  const handleSyncToCloud = async () => {
    // 获取当前所有 store 的数据
    const { useApiStore } = await import('@/store/apiStore')
    const { useViewingHistoryStore } = await import('@/store/viewingHistoryStore')
    const { useSearchStore } = await import('@/store/searchStore')
    const { useSettingStore } = await import('@/store/settingStore')

    const success = await syncToCloud({
      videoSources: useApiStore.getState().videoAPIs,
      viewingHistory: useViewingHistoryStore.getState().viewingHistory,
      searchHistory: useSearchStore.getState().searchHistory,
      settings: {
        network: useSettingStore.getState().network,
        search: useSettingStore.getState().search,
        playback: useSettingStore.getState().playback,
        system: useSettingStore.getState().system,
      },
      searchCache: useSearchStore.getState().searchResultsCache,
    })

    if (success) {
      toast.success('已同步到云端')
    } else {
      toast.error('同步失败，请检查连接状态')
    }
  }

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '从未'
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  // 如果没有配置 Upstash
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

      {/* 连接状态面板 */}
      <div className="rounded-lg border border-gray-200 bg-white/40 p-6 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isConnected
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {isConnected ? <Cloud className="h-6 w-6" /> : <CloudOff className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-100">
                {isConnected ? '已连接 Upstash 数据库' : '未连接 Upstash 数据库'}
              </h3>
              <p className="text-sm text-gray-500">
                {isChecking
                  ? '正在检查连接...'
                  : `上次检查: ${formatTime(lastCheckedAt)}`}
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
      </div>

      {/* 数据库开关 */}
      <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-white/40 p-4 transition-all hover:border-gray-300 hover:bg-white/60 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-800/60">
        <div className="space-y-0.5">
          <Label className="text-base text-gray-800 dark:text-gray-100">启用云端同步</Label>
          <p className="text-sm text-gray-500">
            开启后，数据将自动同步到 Upstash 云端数据库
          </p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={setEnabled}
          disabled={!isConnected}
        />
      </div>

      {/* 操作按钮 */}
      <div className="grid gap-4 sm:grid-cols-3">
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
          onClick={handleSyncFromCloud}
          disabled={!isConnected || !isEnabled || isSyncing}
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          从云端同步
        </Button>

        <Button
          variant="outline"
          onClick={handleSyncToCloud}
          disabled={!isConnected || !isEnabled || isSyncing}
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          同步到云端
        </Button>
      </div>

      {/* 同步状态 */}
      {lastSyncedAt && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            上次同步时间: {formatTime(lastSyncedAt)}
          </p>
        </div>
      )}

      {/* 数据库功能测试 */}
      <DatabaseTest />

      {/* 说明信息 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">数据同步说明</h4>
            <ul className="ml-4 list-disc text-sm text-blue-700 dark:text-blue-300">
              <li>视频源列表、观看历史、搜索历史等数据会同步到云端</li>
              <li>即使更换设备或清除浏览器数据，也能恢复您的个人配置</li>
              <li>数据存储在 Upstash Redis 中，安全可靠</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
