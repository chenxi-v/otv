import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useApiStore } from '@/store/apiStore'
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Tv, Server, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

import type { VideoItem, VideoApi } from '@/types'

type Category = {
  type_id: string | number
  type_name: string
}

export default function SourceBrowser() {
  const navigate = useNavigate()
  const { videoAPIs } = useApiStore()

  const [sources, setSources] = useState<VideoApi[]>([])
  const [activeSource, setActiveSource] = useState<VideoApi | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | number>('1')
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<VideoItem | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)

  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'category' | 'search'>('category')
  const [debounceId, setDebounceId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    console.log('Available video sources:', videoAPIs)
    const enabledSources = videoAPIs.filter(api => api.isEnabled)
    console.log('Enabled video sources:', enabledSources)
    setSources(enabledSources)
    if (enabledSources.length > 0) {
      setActiveSource(enabledSources[0])
    } else {
      console.warn('No enabled video sources found!')
    }
  }, [videoAPIs])

  const fetchCategories = useCallback(async (sourceUrl: string) => {
    if (!sourceUrl) return

    console.log('Fetching categories for source:', sourceUrl)
    setLoadingCategories(true)
    setCategoryError(null)

    try {
      // 构建API URL
      const apiUrl = new URL(sourceUrl)
      apiUrl.searchParams.set('ac', 'list')
      const fullUrl = apiUrl.toString()
      
      // 使用代理系统
      const proxyUrl = `/proxy?url=${encodeURIComponent(fullUrl)}`
      console.log('Using proxy URL:', proxyUrl)
      
      const response = await fetch(proxyUrl)
      console.log('Category fetch response status:', response.status)
      if (!response.ok) throw new Error(`获取分类失败: ${response.status}`)

      const data = await response.json()
      console.log('Category fetch response data:', data)
      
      // 处理不同格式的响应
      const classes = Array.isArray(data.class) ? data.class : []
      const list: Category[] = classes
        .map((c: any) => ({
          type_id: c.type_id ?? c.typeid ?? c.id,
          type_name: c.type_name ?? c.typename ?? c.name,
        }))
        .filter((c: any) => Boolean(c.type_id && c.type_name))
      
      console.log('Parsed categories:', list)
      setCategories(list)
      if (list.length > 0) {
        setActiveCategory(list[0].type_id)
      } else {
        setActiveCategory('1')
      }
    } catch (e) {
      console.error('Error fetching categories:', e)
      setCategoryError(e instanceof Error ? e.message : '获取分类失败')
      setCategories([])
      setActiveCategory('1')
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  useEffect(() => {
    if (activeSource) {
      fetchCategories(activeSource.url)
    }
  }, [activeSource, fetchCategories])

  const fetchItems = async (p = 1) => {
    if (!activeSource || !activeCategory || mode !== 'category') return

    setLoading(true)
    setError(null)

    try {
      // 构建API URL
      const apiUrl = new URL(activeSource.url)
      apiUrl.searchParams.set('ac', 'videolist')
      apiUrl.searchParams.set('t', String(activeCategory))
      apiUrl.searchParams.set('pg', String(p))
      const fullUrl = apiUrl.toString()
      
      // 使用代理系统
      const proxyUrl = `/proxy?url=${encodeURIComponent(fullUrl)}`
      console.log('Using proxy URL for items:', proxyUrl)
      
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error('获取列表失败')

      const data = await response.json()
      console.log('Items response:', data)
      
      // 处理不同格式的响应
      const listData = Array.isArray(data.list) ? data.list : Array.isArray(data.data) ? data.data : []
      const list: VideoItem[] = listData
        .map((r: any) => ({
          id: String(r.vod_id ?? r.id ?? ''),
          vod_id: r.vod_id ?? r.id ?? '',
          vod_name: r.vod_name ?? r.title ?? '',
          vod_pic: r.vod_pic ?? r.pic ?? '',
          vod_year: r.vod_year ?? r.year ?? '',
          type_name: r.type_name ?? '',
          vod_remarks: r.vod_remarks ?? r.remarks ?? '',
          source_name: activeSource?.name,
          source_code: activeSource?.id,
          api_url: activeSource?.url
        }))
        .filter((r: any) => r.vod_id && r.vod_name)

      setItems(list)
      setPage(p)
      setPageCount(data.pagecount ?? data.pageCount ?? 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取列表失败')
      setItems([])
      setPage(1)
      setPageCount(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchSearch = async (q: string, p = 1) => {
    if (!activeSource || !q) return

    setLoading(true)
    setError(null)

    try {
      // 构建API URL
      const apiUrl = new URL(activeSource.url)
      apiUrl.searchParams.set('ac', 'videolist')
      apiUrl.searchParams.set('wd', q)
      apiUrl.searchParams.set('pg', String(p))
      const fullUrl = apiUrl.toString()
      
      // 使用代理系统
      const proxyUrl = `/proxy?url=${encodeURIComponent(fullUrl)}`
      console.log('Using proxy URL for search:', proxyUrl)
      
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error('搜索失败')

      const data = await response.json()
      console.log('Search response:', data)
      
      // 处理不同格式的响应
      const listData = Array.isArray(data.list) ? data.list : Array.isArray(data.data) ? data.data : []
      const list: VideoItem[] = listData
        .map((r: any) => ({
          id: String(r.vod_id ?? r.id ?? ''),
          vod_id: r.vod_id ?? r.id ?? '',
          vod_name: r.vod_name ?? r.title ?? '',
          vod_pic: r.vod_pic ?? r.pic ?? '',
          vod_year: r.vod_year ?? r.year ?? '',
          type_name: r.type_name ?? '',
          vod_remarks: r.vod_remarks ?? r.remarks ?? '',
          source_name: activeSource?.name,
          source_code: activeSource?.id,
          api_url: activeSource?.url
        }))
        .filter((r: any) => r.vod_id && r.vod_name)

      setItems(list)
      setPage(p)
      setPageCount(data.pagecount ?? data.pageCount ?? 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : '搜索失败')
      setItems([])
      setPage(1)
      setPageCount(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeSource && activeCategory && mode === 'category') {
      fetchItems(1)
    }
  }, [activeSource, activeCategory, mode])

  useEffect(() => {
    if (activeSource && mode === 'search' && query.trim()) {
      fetchSearch(query.trim(), 1)
    }
  }, [activeSource, mode, query])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceId) clearTimeout(debounceId)
    const id = setTimeout(() => {
      setMode(val.trim() ? 'search' : 'category')
    }, 500)
    setDebounceId(id)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMode(query.trim() ? 'search' : 'category')
  }

  const handleItemClick = (item: VideoItem) => {
    if (!activeSource) return
    navigate(`/detail/${activeSource.id}/${item.vod_id}`)
  }

  const handlePreview = async (item: VideoItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
    setPreviewLoading(true)
    setPreviewError(null)

    try {
      // 构建API URL
      const apiUrl = new URL(activeSource!.url)
      apiUrl.searchParams.set('ac', 'detail')
      apiUrl.searchParams.set('ids', String(item.vod_id))
      const fullUrl = apiUrl.toString()
      
      // 使用代理系统
      const proxyUrl = `/proxy?url=${encodeURIComponent(fullUrl)}`
      console.log('Using proxy URL for detail:', proxyUrl)
      
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error('获取详情失败')

      const data = await response.json()
      console.log('Detail response:', data)
      
      // 处理不同格式的响应
      const detailData = Array.isArray(data.list) ? data.list : Array.isArray(data.data) ? data.data : []
      const detail = detailData[0]

      if (detail) {
        setPreviewItem({
          ...item,
          vod_remarks: detail.vod_remarks || detail.remarks || item.vod_remarks,
          vod_content: detail.vod_content || detail.content || item.vod_content
        })
      }
    } catch (e) {
      console.error('Error fetching preview:', e)
      setPreviewError(e instanceof Error ? e.message : '获取详情失败')
    } finally {
      setPreviewLoading(false)
    }
  }

  const goToPage = (p: number) => {
    if (p < 1 || p > pageCount || loading) return
    if (mode === 'search' && query.trim()) {
      fetchSearch(query.trim(), p)
    } else if (mode === 'category' && activeCategory) {
      fetchItems(p)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
            >
              返回首页
              <ArrowLeft className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">源浏览器</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">按来源站浏览内容，探索海量影视资源</p>
        </div>

        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Server className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500">暂无可用视频源</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">选择来源站</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {sources.map((source) => (
                        <Button
                          key={source.id}
                          size="sm"
                          variant={activeSource?.id === source.id ? 'solid' : 'bordered'}
                          color={activeSource?.id === source.id ? 'primary' : 'default'}
                          onClick={() => setActiveSource(source)}
                        >
                          {source.name}
                        </Button>
                      ))}
                    </div>
                  </div>
            </div>

            {activeSource && (
              <>
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center">搜索</h2>
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 justify-center">
                      <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="输入关键词进行搜索"
                        className="w-1/2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                      />
                      <Button type="submit" size="sm" className="rounded-full">
                        搜索
                      </Button>
                      {query && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => {
                            setQuery('');
                            setMode('category');
                          }}
                          className="rounded-full"
                        >
                          清除
                        </Button>
                      )}
                    </form>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                      当前模式: {mode === 'search' ? '搜索' : '分类浏览'}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">选择分类</h2>
                    </div>
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Spinner size="sm" />
                        加载分类中...
                      </div>
                    ) : categoryError ? (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {categoryError}
                        </span>
                      </div>
                    ) : categoriesExpanded ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                        {categories.map((category) => (
                          <Button
                            key={String(category.type_id)}
                            variant={activeCategory === category.type_id ? 'solid' : 'bordered'}
                            color={activeCategory === category.type_id ? 'primary' : 'default'}
                            onClick={() => setActiveCategory(category.type_id)}
                            className="h-auto py-2 text-center justify-center text-sm"
                          >
                            {category.type_name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                        {categories.slice(0, 5).map((category) => (
                          <Button
                            key={String(category.type_id)}
                            variant={activeCategory === category.type_id ? 'solid' : 'bordered'}
                            color={activeCategory === category.type_id ? 'primary' : 'default'}
                            onClick={() => setActiveCategory(category.type_id)}
                            className="h-auto py-2 text-center justify-center text-sm"
                          >
                            {category.type_name}
                          </Button>
                        ))}
                      </div>
                    )}
                    {categories.length > 0 && (
                      <div className="flex justify-center mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                          className="animate-bounce flex items-center gap-1"
                        >
                          {categoriesExpanded ? (
                            <ChevronUp className="h-6 w-6" />
                          ) : (
                            <ChevronDown className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

          {loading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="flex justify-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Tv className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">暂无内容</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {items.map((item) => (
                <div
                  key={item.vod_id}
                  className="cursor-pointer group"
                  onClick={() => handlePreview(item)}
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 aspect-[2/3]">
                    {item.vod_pic ? (
                      <img
                        src={item.vod_pic}
                        alt={item.vod_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Tv className="h-8 w-8" />
                      </div>
                    )}
                    {item.vod_year && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs">
                        {item.vod_year}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {item.vod_name}
                    </div>
                    {item.vod_remarks && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {item.vod_remarks}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && items.length > 0 && pageCount > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                size="sm"
                variant="bordered"
                onClick={() => goToPage(page - 1)}
                isDisabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                第 {page} / {pageCount} 页
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={pageCount}
                  defaultValue={page}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-center"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= pageCount) {
                      goToPage(value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="bordered"
                  onClick={() => goToPage(page + 1)}
                  isDisabled={page === pageCount}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </>
        )}

        <Modal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {previewItem?.vod_name}
                  </h2>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {previewLoading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : previewError ? (
                <div className="flex justify-center py-20">
                  <p className="text-red-500">{previewError}</p>
                </div>
              ) : previewItem ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    {previewItem.vod_pic ? (
                      <img
                        src={previewItem.vod_pic}
                        alt={previewItem.vod_name}
                        className="w-full rounded-xl shadow-lg"
                      />
                    ) : (
                      <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <Tv className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">年份：</span>
                      {previewItem.vod_year || '—'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">来源：</span>
                      {activeSource?.name}
                    </div>
                    {previewItem.type_name && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">分类：</span>
                        {previewItem.type_name}
                      </div>
                    )}
                    {previewItem.vod_remarks && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">备注：</span>
                        {previewItem.vod_remarks}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setPreviewOpen(false)}
              >
                关闭
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  setPreviewOpen(false)
                  if (previewItem) handleItemClick(previewItem)
                }}
              >
                查看详情
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
