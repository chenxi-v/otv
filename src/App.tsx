import { OkiLogo, SearchIcon, SettingIcon, CloseIcon } from '@/components/icons'
import { Button, Input, Chip, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchHistory, useSearch } from '@/hooks'

import { useSettingStore } from '@/store/settingStore'
import { initializeCloudSync } from '@/store/cloudSync'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import RecentHistory from '@/components/RecentHistory'
import { isBrowser } from 'react-device-detect'
import { useNavigate } from 'react-router'

import { useVersionStore } from '@/store/versionStore'
const UpdateModal = React.lazy(() => import('@/components/UpdateModal'))

function App() {
  // 路由控制
  const navigate = useNavigate()
  // 删除控制
  const [isSearchHistoryDeleteOpen, setIsSearchHistoryDeleteOpen] = useState(false)

  const { searchHistory, removeSearchHistoryItem, clearSearchHistory } = useSearchHistory()
  const { search, setSearch, searchMovie } = useSearch()

  const { hasNewVersion, setShowUpdateModal } = useVersionStore()
  const { system } = useSettingStore()

  const [buttonTransitionStatus, setButtonTransitionStatus] = useState({
    opacity: 0,
    filter: 'blur(5px)',
  })
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true)
  const [hoveredChipId, setHoveredChipId] = useState<string | null>(null)

  useEffect(() => {
    if (search.length > 0) {
      setButtonTransitionStatus({
        opacity: 1,
        filter: 'blur(0px)',
      })
      setButtonIsDisabled(false)
    } else {
      setButtonIsDisabled(true)
      setButtonTransitionStatus({
        opacity: 0,
        filter: 'blur(5px)',
      })
    }
  }, [search])

  // 检查版本更新
  useEffect(() => {
    // 检查更新
    if (hasNewVersion() && system.isUpdateLogEnabled) {
      setShowUpdateModal(true)
    }
  }, [hasNewVersion, setShowUpdateModal, system.isUpdateLogEnabled])

  // 初始化云端同步
  useEffect(() => {
    console.log('[App] 初始化云端同步...')
    initializeCloudSync()
  }, [])

  // 测试 Upstash 连接
  const testUpstashConnection = async () => {
    const UPSTASH_REDIS_REST_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL
    const UPSTASH_REDIS_REST_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

    console.log('[Test] 环境变量:', {
      hasUrl: !!UPSTASH_REDIS_REST_URL,
      hasToken: !!UPSTASH_REDIS_REST_TOKEN,
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })

    try {
      const { Redis } = await import('@upstash/redis')
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
        alert('Upstash 连接成功！')
      } else {
        console.error('[Test] PING 返回值不正确:', result)
        alert('PING 返回值不正确: ' + result)
      }
    } catch (error) {
      console.error('[Test] 连接失败:', error)
      if (error instanceof Error) {
        console.error('[Test] 错误详情:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        })
        alert('连接失败: ' + error.message)
      }
    }
  }

  const handleSearch = () => {
    searchMovie(search)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      <React.Suspense fallback={null}>
        <UpdateModal />
      </React.Suspense>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div layoutId="history-icon" className="absolute top-5 right-5 z-50 flex gap-4">
          <Button isIconOnly className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl">
            <RecentHistory />
          </Button>
          <Button
            onPress={testUpstashConnection}
            isIconOnly
            className="bg-blue-500/20 shadow-lg shadow-blue-500/10 backdrop-blur-2xl"
            title="测试数据库连接"
          >
            <span className="text-lg">🔌</span>
          </Button>
          <Button
            onPress={() => {
              navigate('/settings')
            }}
            isIconOnly
            className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl"
          >
            <SettingIcon size={25} />
          </Button>
        </motion.div>
        <div className="flex h-full min-h-screen w-full flex-col items-center justify-start md:min-h-0 md:justify-center">
          <motion.div
            layoutId="app-logo"
            transition={{ duration: 0.4 }}
            className="mt-[7rem] flex translate-x-[-1rem] items-end gap-2 text-[1.5rem] md:mt-[10rem] md:text-[2rem]"
          >
            <motion.div layoutId="logo-icon">
              <div className="block md:hidden">
                <OkiLogo size={48} />
              </div>
              <div className="hidden md:block">
                <OkiLogo size={64} />
              </div>
            </motion.div>
            <motion.p layoutId="logo-text" className="font-bold text-inherit">
              OUONNKI TV
            </motion.p>
          </motion.div>
          <motion.div
            layoutId="search-container"
            initial={{ width: 'min(30rem, 90vw)' }}
            whileHover={{
              scale: 1.03,
              width: 'min(30rem, 90vw)',
            }}
            className="mt-[1rem] h-fit px-4 md:px-0"
          >
            <Input
              classNames={{
                base: 'max-w-full h-13',
                mainWrapper: 'h-full',
                input: 'text-md',
                inputWrapper: 'h-full font-normal text-default-500 pr-2 shadow-lg',
              }}
              placeholder="输入内容搜索..."
              size="lg"
              variant="bordered"
              startContent={
                <motion.div layoutId="search-icon">
                  <SearchIcon size={18} />
                </motion.div>
              }
              type="search"
              radius="full"
              value={search}
              onValueChange={setSearch}
              onKeyDown={handleKeyDown}
              endContent={
                <motion.div
                  initial={{ opacity: 0, filter: 'blur(5px)' }}
                  animate={{
                    opacity: buttonTransitionStatus.opacity,
                    filter: buttonTransitionStatus.filter,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    className="bg-gradient-to-br from-gray-500 to-gray-950 font-bold text-white shadow-lg"
                    size="md"
                    radius="full"
                    onPress={handleSearch}
                    isDisabled={buttonIsDisabled}
                  >
                    搜索
                  </Button>
                </motion.div>
              }
            />
          </motion.div>
          {useSettingStore.getState().search.isSearchHistoryVisible && searchHistory.length > 0 && (
            <motion.div
              initial={{ filter: isBrowser ? 'opacity(20%)' : 'opacity(100%)' }}
              whileHover={{
                filter: 'opacity(100%)',
              }}
              transition={{ duration: 0.4 }}
              className="mt-[3rem] flex w-[88vw] flex-col items-start gap-2 px-4 md:w-[42rem] md:flex-row md:px-0"
            >
              <p className="text-lg font-bold">搜索历史：</p>
              <div className="flex flex-col">
                <div className="flex w-full flex-wrap gap-3 md:w-[34rem]">
                  <AnimatePresence mode="popLayout">
                    {searchHistory.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        exit={{ opacity: 0, filter: 'blur(5px)' }}
                        onMouseEnter={() => setHoveredChipId(item.id)}
                        onMouseLeave={() => setHoveredChipId(null)}
                      >
                        <Chip
                          classNames={{
                            base: 'cursor-pointer border-2 border-gray-400 hover:border-black hover:scale-101 transition-all duration-300',
                            content: `transition-all duration-200 ${hoveredChipId === item.id ? 'translate-x-0' : 'translate-x-2'}`,
                            closeButton: `transition-opacity duration-200 ${hoveredChipId === item.id ? 'opacity-100' : 'opacity-0'}`,
                          }}
                          variant="bordered"
                          size="lg"
                          onClick={() => searchMovie(item.content)}
                          onClose={() => {
                            if (hoveredChipId === item.id) {
                              removeSearchHistoryItem(item.id)
                            }
                          }}
                        >
                          {item.content}
                        </Chip>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex justify-end">
                  <div className="w-fit">
                    <Popover
                      placement={isBrowser ? 'top-end' : 'bottom-start'}
                      isOpen={isSearchHistoryDeleteOpen}
                      onOpenChange={setIsSearchHistoryDeleteOpen}
                      isKeyboardDismissDisabled
                      crossOffset={isBrowser ? -20 : -5}
                      classNames={{
                        base: 'bg-transparent',
                        content: 'bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-xl',
                      }}
                    >
                      <PopoverTrigger>
                        <motion.div
                          initial={{ color: '#cccccc' }}
                          whileHover={{ color: '#999999' }}
                          transition={{ duration: 0.4 }}
                          className="flex justify-end gap-2 pt-[1.5rem] pr-[1.8rem] hover:cursor-pointer"
                        >
                          <CloseIcon size={20} />
                          <p className="text-sm">清除全部</p>
                        </motion.div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="px-1 py-2">
                          <p>确定要清除全部搜索记录吗？</p>
                          <div className="mt-[.6rem] flex justify-end gap-[.5rem]">
                            <Button
                              className="h-[1.5rem] w-[3rem] min-w-[3rem] text-[.7rem] font-bold"
                              radius="sm"
                              variant="shadow"
                              onPress={() => setIsSearchHistoryDeleteOpen(false)}
                            >
                              取消
                            </Button>
                            <Button
                              className="h-[1.5rem] w-[3rem] min-w-[3rem] text-[.7rem] font-bold"
                              variant="shadow"
                              color="danger"
                              radius="sm"
                              onPress={clearSearchHistory}
                            >
                              确定
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        {import.meta.env.VITE_DISABLE_ANALYTICS !== 'true' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </motion.div>
    </>
  )
}

export default App
