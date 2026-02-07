import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Film, Tv, ArrowLeft } from 'lucide-react'
import { getDoubanCategories, getDoubanRecommends, type DoubanItem } from '@/services/douban.service'
import { Button } from '@/components/ui/button'
import DoubanSelector from '@/components/DoubanSelector'

const PAGE_SIZE = 25

export default function DoubanPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [type, setType] = useState<'movie' | 'tv' | 'show' | 'anime'>('movie')
  const [primarySelection, setPrimarySelection] = useState<string>('热门')
  const [secondarySelection, setSecondarySelection] = useState<string>('全部')
  const [multiLevelValues, setMultiLevelValues] = useState<Record<string, string>>({
    type: 'all',
    region: 'all',
    year: 'all',
    platform: 'all',
    label: 'all',
    sort: 'T',
  })
  const [selectedWeekday, setSelectedWeekday] = useState<string>('')
  const [doubanData, setDoubanData] = useState<DoubanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const kindParam = searchParams.get('kind') as 'movie' | 'tv' | 'show' | 'anime' | null
    const tagParam = searchParams.get('tag')

    if (kindParam) {
      setType(kindParam)
    }

    if (tagParam) {
      setPrimarySelection(tagParam)
      
      if (kindParam === 'movie') {
        setSecondarySelection('全部')
      } else if (kindParam === 'tv') {
        if (tagParam === '热门') {
          setSecondarySelection('tv')
        } else if (tagParam === '动漫') {
          setSecondarySelection('tv_animation')
        } else if (tagParam === '美剧' || tagParam === '英剧' || tagParam === '韩剧' || tagParam === '日剧' || tagParam === '国产剧') {
          setSecondarySelection(tagParam)
        } else {
          setSecondarySelection('tv')
        }
      } else if (kindParam === 'show') {
        setSecondarySelection('show')
      } else if (kindParam === 'anime') {
        setSecondarySelection('全部')
      }
    }
  }, [searchParams])

  const getRequestParams = useCallback((pageStart: number) => {
    if (type === 'tv' || type === 'show') {
      return {
        kind: type as 'tv' | 'movie',
        category: type,
        type: secondarySelection,
        pageLimit: PAGE_SIZE,
        pageStart,
      }
    }

    return {
      kind: type as 'tv' | 'movie',
      category: primarySelection,
      type: secondarySelection,
      pageLimit: PAGE_SIZE,
      pageStart,
    }
  }, [type, primarySelection, secondarySelection])

  const loadInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setDoubanData([])
    setCurrentPage(1)
    setHasMore(true)
    setPageCount(1)

    try {
      let result

      if (type === 'anime' && primarySelection === '每日放送') {
        result = {
          code: 200,
          message: 'success',
          list: [],
        }
      } else if (type === 'anime') {
        result = await getDoubanRecommends({
          kind: primarySelection === '番剧' ? 'tv' : 'movie',
          pageLimit: PAGE_SIZE,
          pageStart: 0,
          category: '动画',
          format: primarySelection === '番剧' ? '电视剧' : '',
          region: multiLevelValues.region || '',
          year: multiLevelValues.year || '',
          platform: multiLevelValues.platform || '',
          sort: multiLevelValues.sort || 'U',
          label: multiLevelValues.label || '',
        })
      } else if (primarySelection === '全部') {
        result = await getDoubanRecommends({
          kind: type === 'show' ? 'tv' : (type as 'tv' | 'movie'),
          pageLimit: PAGE_SIZE,
          pageStart: 0,
          category: multiLevelValues.type || '',
          format: type === 'show' ? '综艺' : type === 'tv' ? '电视剧' : '',
          region: multiLevelValues.region || '',
          year: multiLevelValues.year || '',
          platform: multiLevelValues.platform || '',
          sort: multiLevelValues.sort || 'T',
          label: multiLevelValues.label || '',
        })
      } else {
        result = await getDoubanCategories(getRequestParams(0))
      }

      if (result.code === 200) {
        setDoubanData(result.list)
        setHasMore(result.list.length !== 0)
        // 假设总页数为10，实际应用中可以根据API返回的总数据量计算
        setPageCount(10)
      }
    } catch (error) {
      console.error('获取豆瓣数据失败:', error)
      setError('获取数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [type, primarySelection, secondarySelection, multiLevelValues, selectedWeekday, getRequestParams])

  const loadPage = useCallback(async (pageNumber: number) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      let result
      const pageStart = (pageNumber - 1) * PAGE_SIZE

      if (type === 'anime' && primarySelection === '每日放送') {
        result = {
          code: 200,
          message: 'success',
          list: [],
        }
      } else if (type === 'anime') {
        result = await getDoubanRecommends({
          kind: primarySelection === '番剧' ? 'tv' : 'movie',
          pageLimit: PAGE_SIZE,
          pageStart: pageStart,
          category: '动画',
          format: primarySelection === '番剧' ? '电视剧' : '',
          region: multiLevelValues.region || '',
          year: multiLevelValues.year || '',
          platform: multiLevelValues.platform || '',
          sort: multiLevelValues.sort || 'U',
          label: multiLevelValues.label || '',
        })
      } else if (primarySelection === '全部') {
        result = await getDoubanRecommends({
          kind: type === 'show' ? 'tv' : (type as 'tv' | 'movie'),
          pageLimit: PAGE_SIZE,
          pageStart: pageStart,
          category: multiLevelValues.type || '',
          format: type === 'show' ? '综艺' : type === 'tv' ? '电视剧' : '',
          region: multiLevelValues.region || '',
          year: multiLevelValues.year || '',
          platform: multiLevelValues.platform || '',
          sort: multiLevelValues.sort || 'T',
          label: multiLevelValues.label || '',
        })
      } else {
        result = await getDoubanCategories(getRequestParams(pageStart))
      }

      if (result.code === 200) {
        setDoubanData(result.list)
        setHasMore(result.list.length !== 0)
        setCurrentPage(pageNumber)
      }
    } catch (error) {
      console.error('加载页面失败:', error)
      setError('加载页面失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [loading, type, primarySelection, secondarySelection, multiLevelValues, getRequestParams])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const handleItemClick = (item: DoubanItem) => {
    const params = new URLSearchParams()
    params.set('q', item.title)
    if (item.year) {
      params.set('year', item.year)
    }
    navigate(`/search/${item.title}?${params.toString()}`)
  }

  const handleTypeChange = (newType: 'movie' | 'tv' | 'show' | 'anime') => {
    setType(newType)
    if (newType === 'movie') {
      setPrimarySelection('热门')
      setSecondarySelection('全部')
    } else if (newType === 'tv') {
      setPrimarySelection('最近热门')
      setSecondarySelection('tv')
    } else if (newType === 'show') {
      setPrimarySelection('最近热门')
      setSecondarySelection('show')
    } else if (newType === 'anime') {
      setPrimarySelection('每日放送')
      setSecondarySelection('全部')
    }
    setMultiLevelValues({
      type: 'all',
      region: 'all',
      year: 'all',
      platform: 'all',
      label: 'all',
      sort: newType === 'anime' ? 'U' : 'T',
    })
    setSelectedWeekday('')
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">豆瓣推荐</h1>

          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              variant={type === 'movie' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('movie')}
            >
              <Film className="h-4 w-4 mr-2" />
              电影
            </Button>
            <Button
              variant={type === 'tv' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('tv')}
            >
              <Tv className="h-4 w-4 mr-2" />
              电视剧
            </Button>
            <Button
              variant={type === 'show' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('show')}
            >
              综艺
            </Button>
            <Button
              variant={type === 'anime' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('anime')}
            >
              动漫
            </Button>
          </div>

          <DoubanSelector
            type={type}
            primarySelection={primarySelection}
            secondarySelection={secondarySelection}
            onPrimaryChange={setPrimarySelection}
            onSecondaryChange={setSecondarySelection}
            onMultiLevelChange={setMultiLevelValues}
            onWeekdayChange={setSelectedWeekday}
          />
        </div>

        {loading && doubanData.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-20">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {doubanData.map(item => (
                <div
                  key={item.id}
                  className="cursor-pointer group"
                  onClick={() => handleItemClick(item)}
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
                        <Film className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="text-sm font-medium line-clamp-2">{item.title}</div>
                      {item.rate && (
                        <div className="text-xs text-yellow-400">⭐ {item.rate}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {item.title}
                    </div>
                    {item.year && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.year}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!loading && !error && doubanData.length > 0 && pageCount > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  第 {currentPage} / {pageCount} 页
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    defaultValue={currentPage}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-center"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= pageCount) {
                        loadPage(value);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}

            {!hasMore && doubanData.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="text-gray-500">没有更多数据了</div>
              </div>
            )}

            {!loading && doubanData.length === 0 && (
              <div className="flex justify-center py-20">
                <div className="text-gray-500">暂无数据</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
