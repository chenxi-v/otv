import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { Spinner } from '@heroui/spinner'
import SettingsPage from '@/pages/Settings'
import RecentHistory from '@/components/RecentHistory'
import { FilmIcon, Layers, SettingIcon } from '@/components/icons'

const Layout = lazy(() => import('@/components/layouts/Layout'))
const SearchResult = lazy(() => import('@/pages/SearchResult'))
const Detail = lazy(() => import('@/pages/Detail'))
const Video = lazy(() => import('@/pages/Video'))
const Douban = lazy(() => import('@/pages/Douban'))
const SourceBrowser = lazy(() => import('@/pages/SourceBrowser'))

import { useApiStore } from '@/store/apiStore'
import { useSearchStore } from '@/store/searchStore'
import { useEffect } from 'react'

function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { initializeEnvSources } = useApiStore()
  const { cleanExpiredCache } = useSearchStore()

  useEffect(() => {
    cleanExpiredCache()

    const needsInitialization = localStorage.getItem('envSourcesInitialized') !== 'true'
    if (needsInitialization) {
      initializeEnvSources()
      localStorage.setItem('envSourcesInitialized', 'true')
    }
  }, [initializeEnvSources, cleanExpiredCache])

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="flex flex-col items-center py-40">
              <Spinner
                classNames={{ label: 'text-gray-500 text-sm' }}
                variant="default"
                size="lg"
                color="default"
                label="加载中..."
              />
            </div>
          }
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={children} />
            <Route element={<Layout />}>
              <Route path="search/:query" element={<SearchResult />} />
              <Route path="video/:sourceCode/:vodId/:episodeIndex" element={<Video />} />
              <Route path="detail/:sourceCode/:vodId" element={<Detail />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="douban" element={<Douban />} />
              <Route path="source-browser" element={<SourceBrowser />} />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>

      {/* 移动端底部导航栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center py-3">
          <div className="flex flex-col items-center gap-1">
            <RecentHistory />
            <span className="text-xs">历史</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => navigate('/douban')}>
            <FilmIcon className="h-5 w-5" />
            <span className="text-xs">豆瓣</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => navigate('/source-browser')}>
            <Layers className="h-5 w-5" />
            <span className="text-xs">源</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => navigate('/settings')}>
            <SettingIcon size={20} />
            <span className="text-xs">设置</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function MyRouter({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AnimatedRoutes>{children}</AnimatedRoutes>
    </BrowserRouter>
  )
}
