import { useDoubanApiStore } from '@/store/doubanApiStore'

const DOUBAN_IMG_DOMAINS = ['img9.doubanio.com', 'img1.doubanio.com', 'img2.doubanio.com', 'img3.doubanio.com']

function isDoubanImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return DOUBAN_IMG_DOMAINS.some(domain => urlObj.hostname === domain)
  } catch {
    return false
  }
}

function getProxiedImageUrl(url: string, imageApiUrl: string): string {
  if (isDoubanImageUrl(url)) {
    if (imageApiUrl === 'https://image.baidu.com/search/down?url=') {
      return `${imageApiUrl}${encodeURIComponent(url)}`
    }
    return `${imageApiUrl}?url=${encodeURIComponent(url)}`
  }
  return url
}

export interface DoubanItem {
  id: string
  title: string
  poster: string
  rate: string
  year: string
}

export interface DoubanResult {
  code: number
  message: string
  list: DoubanItem[]
}

export interface DoubanDetails {
  id: string
  title: string
  poster: string
  rate: string
  year: string
  directors?: string[]
  screenwriters?: string[]
  cast?: string[]
  genres?: string[]
  countries?: string[]
  languages?: string[]
  episodes?: number
  episode_length?: number
  first_aired?: string
  plot_summary?: string
  backdrop?: string
  trailerUrl?: string
}

interface DoubanSearchParams {
  kind: 'tv' | 'movie'
  tag?: string
  category?: string
  type?: string
  pageLimit?: number
  pageStart?: number
  sort?: string
  format?: string
  label?: string
  region?: string
  year?: string
  platform?: string
}

export async function getDoubanCategories(
  params: DoubanSearchParams
): Promise<DoubanResult> {
  const { kind, tag = '热门', category, type, pageLimit = 20, pageStart = 0 } = params

  const dataApi = useDoubanApiStore.getState().getSelectedDataApi()
  const imageApi = useDoubanApiStore.getState().getSelectedImageApi()

  if (!dataApi) {
    throw new Error('No data API selected')
  }

  const isMobileApi = dataApi.id === 'ali-cdn' || dataApi.id === 'tencent-cdn'
  let targetUrl: string

  if (isMobileApi) {
    targetUrl = `/api/douban?kind=${kind}&category=${encodeURIComponent(category || tag)}&type=${encodeURIComponent(type || kind)}&limit=${pageLimit}&start=${pageStart}&api=${dataApi.id}`
  } else {
    targetUrl = `/api/douban/categories?kind=${kind}&category=${encodeURIComponent(category || tag)}&type=${encodeURIComponent(type || kind)}&limit=${pageLimit}&start=${pageStart}`
  }

  const response = await fetch(targetUrl)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  const imageApiUrl = imageApi?.imageApiUrl || '/api/douban-image'
  
  return {
    ...data,
    list: data.list.map((item: DoubanItem) => ({
      ...item,
      poster: getProxiedImageUrl(item.poster, imageApiUrl),
    })),
  }
}

export async function getDoubanRecommends(
  params: DoubanSearchParams
): Promise<DoubanResult> {
  const { kind, tag = '热门', pageLimit = 20, pageStart = 0, sort, format, label, region, year, platform } = params

  const dataApi = useDoubanApiStore.getState().getSelectedDataApi()
  const imageApi = useDoubanApiStore.getState().getSelectedImageApi()

  if (!dataApi) {
    throw new Error('No data API selected')
  }

  const isMobileApi = dataApi.id === 'ali-cdn' || dataApi.id === 'tencent-cdn'
  let targetUrl: string

  if (isMobileApi) {
    const queryParams = new URLSearchParams({
      kind,
      tag,
      limit: pageLimit.toString(),
      start: pageStart.toString(),
      api: dataApi.id,
    })

    if (sort) {
      queryParams.append('sort', sort)
    }
    if (format) {
      queryParams.append('format', format)
    }
    if (label) {
      queryParams.append('label', label)
    }
    if (region) {
      queryParams.append('region', region)
    }
    if (year) {
      queryParams.append('year', year)
    }
    if (platform) {
      queryParams.append('platform', platform)
    }

    targetUrl = `/api/douban?${queryParams.toString()}`
  } else {
    const queryParams = new URLSearchParams({
      kind,
      tag,
      limit: pageLimit.toString(),
      start: pageStart.toString(),
    })

    if (sort) {
      queryParams.append('sort', sort)
    }
    if (format) {
      queryParams.append('format', format)
    }
    if (label) {
      queryParams.append('label', label)
    }
    if (region) {
      queryParams.append('region', region)
    }
    if (year) {
      queryParams.append('year', year)
    }
    if (platform) {
      queryParams.append('platform', platform)
    }

    targetUrl = `${dataApi.dataApiUrl}?${queryParams.toString()}`
  }

  const response = await fetch(targetUrl)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  const data = await response.json()
  const imageApiUrl = imageApi?.imageApiUrl || '/api/douban-image'
  
  return {
    ...data,
    list: data.list.map((item: DoubanItem) => ({
      ...item,
      poster: getProxiedImageUrl(item.poster, imageApiUrl),
    })),
  }
}

export async function getDoubanDetails(
  id: string
): Promise<{ code: number; message: string; data?: DoubanDetails }> {
  const response = await fetch(`/api/douban/details?id=${id}`)

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  return response.json()
}
