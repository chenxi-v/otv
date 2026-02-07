import SideBar from '@/components/settings/layouts/SideBar'
import ModuleContent from '@/components/settings/layouts/ModuleContent'
import { useState } from 'react'
import { type SettingModuleList } from '@/types'
import { ListVideo, Info, ArrowLeft, Menu, Globe, Search, Play, Database, LogOut, Settings } from 'lucide-react'
import VideoSource from '@/components/settings/VideoSource'
import NetworkSettings from '@/components/settings/NetworkSettings'
import SearchSettings from '@/components/settings/SearchSettings'
import PlaybackSettings from '@/components/settings/PlaybackSettings'
import DatabaseStatus from '@/components/settings/DatabaseStatus'
import DoubanApiSettings from '@/components/settings/DoubanApiSettings'

import AboutProject from '@/components/settings/AboutProject'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { logout, username } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('已登出')
    navigate('/')
  }

  const SideBarModules: SettingModuleList = [
    {
      id: 'video_source',
      name: '视频源管理',
      icon: <ListVideo />,
      component: <VideoSource />,
    },
    {
      id: 'douban_api',
      name: '豆瓣API配置',
      icon: <Settings />,
      component: <DoubanApiSettings />,
    },
    {
      id: 'database_status',
      name: '数据库状态',
      icon: <Database />,
      component: <DatabaseStatus />,
    },
    {
      id: 'network_settings',
      name: '网络设置',
      icon: <Globe />,
      component: <NetworkSettings />,
    },
    {
      id: 'search_settings',
      name: '搜索设置',
      icon: <Search />,
      component: <SearchSettings />,
    },
    {
      id: 'playback_settings',
      name: '播放设置',
      icon: <Play />,
      component: <PlaybackSettings />,
    },
    {
      id: 'about_project',
      name: '关于',
      icon: <Info />,
      component: <AboutProject />,
    },
  ]
  const [activeId, setActiveId] = useState(SideBarModules[0].id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const currentModule = SideBarModules.find(module => module.id === activeId) || SideBarModules[0]

  return (
    <div className="min-h-[90vh] pt-3 pb-20">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-1 pr-2 md:px-0">
        <Button
          variant="ghost"
          className="hover:bg-white/20 hover:backdrop-blur-xl"
          onClick={() => navigate('/')}
        >
          <ArrowLeft /> 返回
        </Button>
        <div className="flex items-center gap-2">
          {username && (
            <span className="hidden text-sm text-gray-600 md:block">欢迎, {username}</span>
          )}
          <Button
            variant="ghost"
            className="hover:bg-white/20 hover:backdrop-blur-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">登出</span>
          </Button>
          {/* 桌面端侧边栏切换按钮 */}
          <div className="flex items-center gap-0 md:hidden">
            <Button
              variant="ghost"
              className="hover:bg-white/20 hover:backdrop-blur-xl"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="text-sm font-medium text-gray-700">{currentModule.name}</span>
              <Menu />
            </Button>
          </div>
        </div>
      </div>

      {/* 移动端模块选择器 */}
      <div className="md:hidden overflow-x-auto whitespace-nowrap py-3 px-4 border-b border-gray-200 dark:border-gray-800">
        {SideBarModules.map(module => (
          <Button
            key={module.id}
            variant={activeId === module.id ? "default" : "ghost"}
            className={`mx-1 px-4 py-2 rounded-full ${activeId === module.id ? 'bg-gray-800 text-white' : 'bg-white/80 dark:bg-gray-900/80'}`}
            onClick={() => setActiveId(module.id)}
          >
            <span className="flex items-center gap-2">
              {module.icon}
              <span>{module.name}</span>
            </span>
          </Button>
        ))}
      </div>

      {/* 桌面端侧边栏和内容 */}
      <div className="hidden mt-2 flex-col gap-4 md:flex md:flex-row md:gap-8">
        <div className="md:block md:min-h-[80vh] md:w-70">
          <div className="px-5 md:px-0">
            <SideBar
              className="w-full border-r-0 border-gray-300/70 pb-2 md:w-full md:border-r md:pt-4 md:pr-8 md:pb-15 md:pl-2"
              activeId={activeId}
              modules={SideBarModules}
              onSelect={id => setActiveId(id)}
            />
          </div>
        </div>
        <ModuleContent module={currentModule} />
      </div>

      {/* 移动端内容 */}
      <div className="md:hidden mt-4 px-4">
        <ModuleContent module={currentModule} />
      </div>
    </div>
  )
}
