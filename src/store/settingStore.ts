import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_SETTINGS } from '@/config/settings.config'
import { useUpstashStore } from './upstashStore'
import { isUpstashConfigured } from '@/services/upstash.service'

interface NetworkSettings {
  defaultTimeout: number
  defaultRetry: number
}

interface SearchSettings {
  isSearchHistoryEnabled: boolean
  isSearchHistoryVisible: boolean
  searchCacheExpiryHours: number
}

interface PlaybackSettings {
  isViewingHistoryEnabled: boolean
  isViewingHistoryVisible: boolean
  isAutoPlayEnabled: boolean
  defaultEpisodeOrder: 'asc' | 'desc'
  adFilteringEnabled: boolean
}

interface SystemSettings {
  isUpdateLogEnabled: boolean
}

interface SettingState {
  network: NetworkSettings
  search: SearchSettings
  playback: PlaybackSettings
  system: SystemSettings
}

interface SettingActions {
  // Network
  setNetworkSettings: (settings: Partial<NetworkSettings>) => void

  // Search
  setSearchSettings: (settings: Partial<SearchSettings>) => void

  // Playback
  setPlaybackSettings: (settings: Partial<PlaybackSettings>) => void

  // System
  setSystemSettings: (settings: Partial<SystemSettings>) => void

  // Reset
  resetSettings: () => void
}

type SettingStore = SettingState & SettingActions

// 同步设置到 Upstash 的辅助函数
const syncSettingsToUpstash = (state: SettingState) => {
  const upstashStore = useUpstashStore.getState()
  if (isUpstashConfigured() && upstashStore.isEnabled) {
    upstashStore.saveSettings({
      network: state.network,
      search: state.search,
      playback: state.playback,
      system: state.system,
    })
  }
}

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      immer<SettingStore>((set, get) => ({
        network: DEFAULT_SETTINGS.network,
        search: DEFAULT_SETTINGS.search,
        playback: DEFAULT_SETTINGS.playback,
        system: DEFAULT_SETTINGS.system,

        setNetworkSettings: settings => {
          set(state => {
            state.network = { ...state.network, ...settings }
          })
          // 同步到 Upstash
          syncSettingsToUpstash(get())
        },

        setSearchSettings: settings => {
          set(state => {
            state.search = { ...state.search, ...settings }
          })
          // 同步到 Upstash
          syncSettingsToUpstash(get())
        },

        setPlaybackSettings: settings => {
          set(state => {
            state.playback = { ...state.playback, ...settings }
          })
          // 同步到 Upstash
          syncSettingsToUpstash(get())
        },

        setSystemSettings: settings => {
          set(state => {
            state.system = { ...state.system, ...settings }
          })
          // 同步到 Upstash
          syncSettingsToUpstash(get())
        },

        resetSettings: () => {
          set(state => {
            state.network = DEFAULT_SETTINGS.network
            state.search = DEFAULT_SETTINGS.search
            state.playback = DEFAULT_SETTINGS.playback
            state.system = DEFAULT_SETTINGS.system
          })
          // 同步到 Upstash
          syncSettingsToUpstash(get())
        },
      })),
      {
        name: 'ouonnki-tv-setting-store',
        version: 1,
      },
    ),
    {
      name: 'SettingStore',
    },
  ),
)
