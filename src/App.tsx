import { OkiLogo, SearchIcon, SettingIcon, CloseIcon, FilmIcon, TvIcon, ChevronRight, PlayCircle, Mic, Layers } from '@/components/icons'
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
import AuthGuard from '@/components/AuthGuard'
import { getDoubanCategories, type DoubanItem } from '@/services/douban.service'
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

  const [hotMovies, setHotMovies] = useState<DoubanItem[]>([])
  const [hotTvShows, setHotTvShows] = useState<DoubanItem[]>([])
  const [animeShows, setAnimeShows] = useState<DoubanItem[]>([])
  const [varietyShows, setVarietyShows] = useState<DoubanItem[]>([])
  const [loadingDouban, setLoadingDouban] = useState(false)

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

  // 加载豆瓣推荐数据
  useEffect(() => {
    const loadDoubanData = async () => {
      setLoadingDouban(true)
      try {
        console.log('开始加载数据...')
        
        const results = await Promise.allSettled([
          getDoubanCategories({
            kind: 'movie',
            category: '热门',
            type: '全部',
            pageLimit: 5,
            pageStart: 0,
          }),
          getDoubanCategories({
            kind: 'tv',
            category: 'tv',
            type: 'tv',
            pageLimit: 5,
            pageStart: 0,
          }),
          getDoubanCategories({
            kind: 'tv',
            category: 'show',
            type: 'show',
            pageLimit: 5,
            pageStart: 0,
          }),
          getDoubanCategories({
            kind: 'tv',
            category: 'tv',
            type: 'tv_animation',
            pageLimit: 5,
            pageStart: 0,
          }),
        ])

        const hotMoviesResult = results[0].status === 'fulfilled' ? results[0].value : null
        const hotTvShowsResult = results[1].status === 'fulfilled' ? results[1].value : null
        const varietyResult = results[2].status === 'fulfilled' ? results[2].value : null
        const animeResult = results[3].status === 'fulfilled' ? results[3].value : null

        console.log('数据加载完成:', { hotMoviesResult, hotTvShowsResult, varietyResult, animeResult })

        if (hotMoviesResult && hotMoviesResult.code === 200) {
          setHotMovies(hotMoviesResult.list)
        }
        if (hotTvShowsResult && hotTvShowsResult.code === 200) {
          setHotTvShows(hotTvShowsResult.list)
        }
        if (varietyResult && varietyResult.code === 200) {
          setVarietyShows(varietyResult.list)
        }
        if (animeResult && animeResult.code === 200) {
          setAnimeShows(animeResult.list)
        }
      } catch (error) {
        console.error('加载豆瓣推荐失败:', error)
      } finally {
        setLoadingDouban(false)
      }
    }

    loadDoubanData()
  }, [])



  const handleSearch = () => {
    searchMovie(search)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <AuthGuard>
      <React.Suspense fallback={null}>
        <UpdateModal />
      </React.Suspense>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 桌面端顶部按钮 */}
        <motion.div layoutId="history-icon" className="hidden md:flex absolute top-5 right-5 z-50 flex gap-4">
          <Button isIconOnly className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl">
            <RecentHistory />
          </Button>
          <Button
            onPress={() => {
              navigate('/douban')
            }}
            isIconOnly
            className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl"
            title="豆瓣推荐"
          >
            <FilmIcon className="h-5 w-5" />
          </Button>
          <Button
            onPress={() => {
              navigate('/source-browser')
            }}
            isIconOnly
            className="bg-white/20 shadow-lg shadow-gray-500/10 backdrop-blur-2xl"
            title="源浏览器"
          >
            <Layers className="h-5 w-5" />
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



          <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <motion.div
            layoutId="app-logo"
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 text-[1.5rem] md:text-[2rem] mb-8"
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
          <div className="flex justify-center mb-8">
            <motion.div
              layoutId="search-container"
              initial={{ width: 'min(30rem, 90vw)' }}
              whileHover={{
                scale: 1.03,
                width: 'min(30rem, 90vw)',
              }}
              className="h-fit"
            >
              <Input
                classNames={{
                  base: 'max-w-full h-13',
                  mainWrapper: 'h-full',
                  input: 'text-md',
                  inputWrapper: 'h-full font-normal text-default-500 pr-2 shadow-lg border-2 border-black',
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
          </div>
          {useSettingStore.getState().search.isSearchHistoryVisible && searchHistory.length > 0 && (
            <motion.div
              initial={{ filter: isBrowser ? 'opacity(20%)' : 'opacity(100%)' }}
              whileHover={{
                filter: 'opacity(100%)',
              }}
              transition={{ duration: 0.4 }}
              className="w-full mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-bold">搜索历史</p>
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
                      className="flex items-center gap-1 hover:cursor-pointer"
                    >
                        <CloseIcon size={16} />
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
              <div className="flex flex-wrap gap-3">
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
            </motion.div>
          )}

          {!loadingDouban && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 w-full"
            >
              {hotMovies.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FilmIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">热门电影</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/douban?kind=movie&tag=热门&category=热门&type=全部')}
                    >
                      查看更多 <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {hotMovies.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set('q', item.title)
                          if (item.year) {
                            params.set('year', item.year)
                          }
                          navigate(`/search/${item.title}?${params.toString()}`)
                        }}
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 aspect-[2/3]">
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <FilmIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </div>
                          {item.rate && (
                            <div className="text-xs text-yellow-500">⭐ {item.rate}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hotTvShows.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TvIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">热门剧集</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/douban?kind=tv&tag=热门&category=tv&type=tv')}
                    >
                      查看更多 <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {hotTvShows.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set('q', item.title)
                          if (item.year) {
                            params.set('year', item.year)
                          }
                          navigate(`/search/${item.title}?${params.toString()}`)
                        }}
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 aspect-[2/3]">
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <TvIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </div>
                          {item.rate && (
                            <div className="text-xs text-yellow-500">⭐ {item.rate}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {animeShows.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">新番放送</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/douban?kind=tv&tag=动漫&category=tv&type=tv_animation')}
                    >
                      查看更多 <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {animeShows.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set('q', item.title)
                          if (item.year) {
                            params.set('year', item.year)
                          }
                          navigate(`/search/${item.title}?${params.toString()}`)
                        }}
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 aspect-[2/3]">
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <PlayCircle className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </div>
                          {item.rate && (
                            <div className="text-xs text-yellow-500">⭐ {item.rate}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {varietyShows.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">热门综艺</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/douban?kind=tv&tag=综艺&category=show&type=show')}
                    >
                      查看更多 <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {varietyShows.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set('q', item.title)
                          if (item.year) {
                            params.set('year', item.year)
                          }
                          navigate(`/search/${item.title}?${params.toString()}`)
                        }}
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 aspect-[2/3]">
                          {item.poster ? (
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              <Mic className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </div>
                          {item.rate && (
                            <div className="text-xs text-yellow-500">⭐ {item.rate}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
    </AuthGuard>
  )
}

export default App
