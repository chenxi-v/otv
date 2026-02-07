import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface DoubanApiConfig {
  id: string
  name: string
  dataApiUrl: string
  imageApiUrl: string
  isEnabled: boolean
}

interface DoubanApiState {
  doubanApis: DoubanApiConfig[]
  selectedDataApiId: string | null
  selectedImageApiId: string | null
}

interface DoubanApiActions {
  setDoubanApis: (apis: DoubanApiConfig[]) => void
  addDoubanApi: (api: DoubanApiConfig) => void
  removeDoubanApi: (id: string) => void
  updateDoubanApi: (id: string, api: Partial<DoubanApiConfig>) => void
  setSelectedDataApiId: (id: string | null) => void
  setSelectedImageApiId: (id: string | null) => void
  getSelectedDataApi: () => DoubanApiConfig | null
  getSelectedImageApi: () => DoubanApiConfig | null
  resetDoubanApis: () => void
}

type DoubanApiStore = DoubanApiState & DoubanApiActions

const DEFAULT_DOUBAN_APIS: DoubanApiConfig[] = [
  {
    id: 'default',
    name: '默认API',
    dataApiUrl: '/api/douban',
    imageApiUrl: '/api/douban-image',
    isEnabled: true,
  },
  {
    id: 'ali-cdn',
    name: '阿里CDN',
    dataApiUrl: 'https://m.douban.cmliussss.com/rexxar/api/v2',
    imageApiUrl: '/api/douban-image',
    isEnabled: true,
  },
  {
    id: 'tencent-cdn',
    name: '腾讯CDN',
    dataApiUrl: 'https://m.douban.cmliussss.net/rexxar/api/v2',
    imageApiUrl: '/api/douban-image',
    isEnabled: true,
  },
  {
    id: 'baidu',
    name: '百度图片代理',
    dataApiUrl: '/api/douban',
    imageApiUrl: 'https://image.baidu.com/search/down?url=',
    isEnabled: true,
  },
]

export const useDoubanApiStore = create<DoubanApiStore>()(
  devtools(
    persist(
      (set, get) => ({
        doubanApis: DEFAULT_DOUBAN_APIS,
        selectedDataApiId: 'default',
        selectedImageApiId: 'default',

        setDoubanApis: (apis) => {
          set({ doubanApis: apis })
        },

        addDoubanApi: (api) => {
          set(state => ({
            doubanApis: [...state.doubanApis, api],
          }))
        },

        removeDoubanApi: (id) => {
          set(state => {
            const newApis = state.doubanApis.filter(api => api.id !== id)
            let newSelectedDataApiId = state.selectedDataApiId
            let newSelectedImageApiId = state.selectedImageApiId
            
            if (state.selectedDataApiId === id) {
              newSelectedDataApiId = newApis.length > 0 ? newApis[0].id : null
            }
            if (state.selectedImageApiId === id) {
              newSelectedImageApiId = newApis.length > 0 ? newApis[0].id : null
            }
            
            return {
              doubanApis: newApis,
              selectedDataApiId: newSelectedDataApiId,
              selectedImageApiId: newSelectedImageApiId,
            }
          })
        },

        updateDoubanApi: (id, api) => {
          set(state => ({
            doubanApis: state.doubanApis.map(a => (a.id === id ? { ...a, ...api } : a)),
          }))
        },

        setSelectedDataApiId: (id) => {
          set({ selectedDataApiId: id })
        },

        setSelectedImageApiId: (id) => {
          set({ selectedImageApiId: id })
        },

        getSelectedDataApi: () => {
          const state = get()
          return state.doubanApis.find(api => api.id === state.selectedDataApiId) || null
        },

        getSelectedImageApi: () => {
          const state = get()
          return state.doubanApis.find(api => api.id === state.selectedImageApiId) || null
        },

        resetDoubanApis: () => {
          set({
            doubanApis: DEFAULT_DOUBAN_APIS,
            selectedDataApiId: 'default',
            selectedImageApiId: 'default',
          })
        },
      }),
      {
        name: 'douban-api-storage',
      }
    )
  )
)