import type { Plugin } from 'vite'
import { handleProxyRequest, getTargetUrl } from '../utils/proxy'

const DOUBAN_BASE_URL = 'https://movie.douban.com/j'

async function handleDoubanRequest(endpoint: string, params: URLSearchParams): Promise<Response> {
  const url = `${DOUBAN_BASE_URL}${endpoint}?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      Referer: 'https://movie.douban.com/',
    },
  })

  return response
}

async function handleDoubanImageRequest(imageUrl: string): Promise<Response> {
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Referer: 'https://movie.douban.com/',
    },
  })

  return response
}

export function proxyMiddleware(): Plugin {
  return {
    name: 'proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/proxy') && !req.url?.startsWith('/api/douban') && !req.url?.startsWith('/api/douban-image') && !req.url?.startsWith('/api/source-browser')) {
          return next()
        }

        if (req.url?.startsWith('/api/douban-image')) {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const imageUrl = url.searchParams.get('url')

            if (!imageUrl) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Image URL parameter is required' }))
              return
            }

            const response = await handleDoubanImageRequest(decodeURIComponent(imageUrl))
            const contentType = response.headers.get('content-type') || 'image/jpeg'

            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Content-Type', contentType)
            res.setHeader('Cache-Control', 'public, max-age=86400')
            res.writeHead(response.status)
            
            const arrayBuffer = await response.arrayBuffer()
            res.end(Buffer.from(arrayBuffer))
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Failed to fetch douban image', message }))
          }
          return
        }

        if (req.url?.startsWith('/api/douban')) {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const kind = url.searchParams.get('kind')
            const category = url.searchParams.get('category')
            const type = url.searchParams.get('type')
            const tag = url.searchParams.get('tag')
            const limit = url.searchParams.get('limit')
            const start = url.searchParams.get('start')
            const sort = url.searchParams.get('sort')
            const format = url.searchParams.get('format')
            const label = url.searchParams.get('label')
            const region = url.searchParams.get('region')
            const year = url.searchParams.get('year')
            const platform = url.searchParams.get('platform')
            const apiUrl = url.searchParams.get('api')

            if (!kind) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Kind parameter is required' }))
              return
            }

            let targetUrl: string
            let isMobileApi = false

            if (url.pathname.includes('/api/douban/categories')) {
              targetUrl = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${kind}?start=${start}&limit=${limit}&category=${category}&type=${type}`
            } else if (url.pathname.includes('/api/douban/recommends')) {
              const selectedCategories = { 类型: category || '' } as any
              if (format && format !== 'all') {
                selectedCategories['形式'] = format
              }
              if (region && region !== 'all') {
                selectedCategories['地区'] = region
              }

              const tags = [] as Array<string>
              if (category && category !== 'all') {
                tags.push(category)
              }
              if (!category && format && format !== 'all') {
                tags.push(format)
              }
              if (label && label !== 'all') {
                tags.push(label)
              }
              if (region && region !== 'all') {
                tags.push(region)
              }
              if (year && year !== 'all') {
                tags.push(year)
              }
              if (platform && platform !== 'all') {
                tags.push(platform)
              }

              const baseUrl = `https://m.douban.com/rexxar/api/v2/${kind}/recommend`
              const params = new URLSearchParams()
              params.append('refresh', '0')
              params.append('start', start || '0')
              params.append('count', limit || '20')
              params.append('selected_categories', JSON.stringify(selectedCategories))
              params.append('uncollect', 'false')
              params.append('score_range', '0,10')
              params.append('tags', tags.join(','))
              if (sort && sort !== 'T') {
                params.append('sort', sort)
              }

              targetUrl = `${baseUrl}?${params.toString()}`
              console.log('[Douban API] Recommends URL:', targetUrl)
            } else if (apiUrl === 'ali-cdn') {
              targetUrl = `https://m.douban.cmliussss.com/rexxar/api/v2/subject/recent_hot/${kind}?start=${start}&limit=${limit}&category=${category}&type=${type}`
              isMobileApi = true
            } else if (apiUrl === 'tencent-cdn') {
              targetUrl = `https://m.douban.cmliussss.net/rexxar/api/v2/subject/recent_hot/${kind}?start=${start}&limit=${limit}&category=${category}&type=${type}`
              isMobileApi = true
            } else {
              targetUrl = `${DOUBAN_BASE_URL}/search_subjects`
            }

            let response: Response
            if (isMobileApi) {
              response = await fetch(targetUrl, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Accept: 'application/json, text/plain, */*',
                  Referer: 'https://movie.douban.com/',
                },
              })
            } else if (url.pathname.includes('/api/douban/categories')) {
              response = await fetch(targetUrl, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Accept: 'application/json, text/plain, */*',
                  Referer: 'https://movie.douban.com/',
                },
              })
            } else {
              const params = new URLSearchParams()
              params.append('type', kind)

              if (tag) {
                params.append('tag', tag)
              } else if (category) {
                params.append('tag', category)
              }

              if (limit) {
                params.append('page_limit', limit)
              }

              if (start) {
                params.append('page_start', start)
              }

              if (sort) {
                params.append('sort', sort)
              }

              response = await handleDoubanRequest('/search_subjects', params)
            }

            const data = await response.json()
            console.log('[Douban API] 返回数据:', JSON.stringify(data, null, 2))

            let transformedData: any

            if (data.items) {
              console.log('[Douban API] 使用 items 格式')
              const transformedList = data.items.map((item: any) => {
                const posterUrl = item.pic?.normal || item.pic?.large || ''
                console.log(`[Douban API] 项目 ${item.id}:`, {
                  title: item.title,
                  pic: item.pic,
                  posterUrl,
                  rating: item.rating?.value
                })
                return {
                  id: item.id,
                  title: item.title,
                  poster: posterUrl,
                  rate: item.rating?.value ? item.rating.value.toFixed(1) : '',
                  year: item.card_subtitle?.match(/(\d{4})/)?.[1] || '',
                }
              })
              transformedData = {
                code: 200,
                message: 'success',
                list: transformedList,
              }
            } else if (data.subjects) {
              console.log('[Douban API] 使用 subjects 格式')
              const transformedList = data.subjects.map((item: any) => {
                console.log(`[Douban API] 项目 ${item.id}:`, {
                  title: item.title,
                  cover: item.cover,
                  rating: item.rate
                })
                return {
                  id: item.id,
                  title: item.title,
                  poster: item.cover,
                  rate: item.rate,
                  year: item.year || '',
                }
              })
              transformedData = {
                code: 200,
                message: 'success',
                list: transformedList,
              }
            } else {
              console.log('[Douban API] 使用默认格式')
              transformedData = {
                code: 200,
                message: 'success',
                list: [],
              }
            }

            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'public, max-age=300')
            res.writeHead(200)
            res.end(JSON.stringify(transformedData))
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Failed to fetch douban data', message }))
          }
          return
        }

        if (req.url?.startsWith('/api/source-browser')) {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`)
            const pathname = url.pathname

            if (pathname === '/api/source-browser/categories') {
              const source = url.searchParams.get('source')
              if (!source) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Source parameter is required' }))
                return
              }

              const sourceUrl = new URL(source)
              sourceUrl.searchParams.set('ac', 'list')

              const response = await fetch(sourceUrl.toString(), {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Accept: 'application/json, text/plain, */*',
                },
              })

              if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`)
              }

              const data = await response.json()
              const classes = Array.isArray(data.class) ? data.class : []
              const categories = classes
                .map((c: any) => ({
                  type_id: c.type_id ?? c.typeid ?? c.id,
                  type_name: c.type_name ?? c.typename ?? c.name,
                }))
                .filter((c: any) => Boolean(c.type_id && c.type_name))

              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'public, max-age=300')
              res.writeHead(200)
              res.end(JSON.stringify({ categories }))
              return
            } else if (pathname === '/api/source-browser/list') {
              const source = url.searchParams.get('source')
              const typeId = url.searchParams.get('type_id')
              const page = url.searchParams.get('page') || '1'

              if (!source || !typeId) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Source and Type ID parameters are required' }))
                return
              }

              const sourceUrl = new URL(source)
              sourceUrl.searchParams.set('ac', 'videolist')
              sourceUrl.searchParams.set('t', typeId)
              sourceUrl.searchParams.set('pg', page)

              const response = await fetch(sourceUrl.toString(), {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Accept: 'application/json, text/plain, */*',
                },
              })

              if (!response.ok) {
                throw new Error(`Failed to fetch list: ${response.statusText}`)
              }

              const data = await response.json()
              const list = Array.isArray(data.list) ? data.list : Array.isArray(data.data) ? data.data : []
              const items = list
                .map((r: any) => ({
                  id: String(r.vod_id ?? r.id ?? ''),
                  title: String(r.vod_name ?? r.title ?? ''),
                  poster: String(r.vod_pic ?? r.pic ?? ''),
                  year: String(r.vod_year ?? r.year ?? ''),
                  type_name: String(r.type_name ?? ''),
                  remarks: String(r.vod_remarks ?? r.remarks ?? ''),
                }))
                .filter((r: any) => r.id && r.title)

              const meta = {
                page: Number(data.page ?? page),
                pagecount: Number(data.pagecount ?? data.pageCount ?? 1),
                total: Number(data.total ?? items.length),
                limit: Number(data.limit ?? data.pageSize ?? 0),
              }

              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'public, max-age=300')
              res.writeHead(200)
              res.end(JSON.stringify({
                items,
                meta,
              }))
              return
            } else if (pathname === '/api/source-browser/search') {
              const source = url.searchParams.get('source')
              const q = url.searchParams.get('q')
              const page = url.searchParams.get('page') || '1'

              if (!source || !q) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Source and Query parameters are required' }))
                return
              }

              const sourceUrl = new URL(source)
              sourceUrl.searchParams.set('wd', q)
              sourceUrl.searchParams.set('pg', page)

              const response = await fetch(sourceUrl.toString(), {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Accept: 'application/json, text/plain, */*',
                },
              })

              if (!response.ok) {
                throw new Error(`Failed to search: ${response.statusText}`)
              }

              const data = await response.json()
              const list = Array.isArray(data.list) ? data.list : Array.isArray(data.data) ? data.data : []
              const items = list
                .map((r: any) => ({
                  id: String(r.vod_id ?? r.id ?? ''),
                  title: String(r.vod_name ?? r.title ?? ''),
                  poster: String(r.vod_pic ?? r.pic ?? ''),
                  year: String(r.vod_year ?? r.year ?? ''),
                  type_name: String(r.type_name ?? ''),
                  remarks: String(r.vod_remarks ?? r.remarks ?? ''),
                }))
                .filter((r: any) => r.id && r.title)

              const meta = {
                page: Number(data.page ?? page),
                pagecount: Number(data.pagecount ?? data.pageCount ?? 1),
                total: Number(data.total ?? items.length),
                limit: Number(data.limit ?? data.pageSize ?? 0),
              }

              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'public, max-age=300')
              res.writeHead(200)
              res.end(JSON.stringify({
                items,
                meta,
              }))
              return
            } else if (pathname === '/api/source-browser/detail') {
              const source = url.searchParams.get('source')
              const ids = url.searchParams.get('ids')

              if (!source || !ids) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Source and IDs parameters are required' }))
                return
              }

              const sourceUrl = new URL(source)
              sourceUrl.searchParams.set('ac', 'detail')
              sourceUrl.searchParams.set('ids', ids)

              const response = await fetch(sourceUrl.toString(), {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Accept: 'application/json, text/plain, */*',
                },
              })

              if (!response.ok) {
                throw new Error(`Failed to fetch detail: ${response.statusText}`)
              }

              const data = await response.json()

              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'public, max-age=300')
              res.writeHead(200)
              res.end(JSON.stringify(data))
              return
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Failed to fetch source browser data', message }))
          }
          return
        }

        try {
          const targetUrl = getTargetUrl(req.url)
          const response = await handleProxyRequest(targetUrl)
          const text = await response.text()
          const contentType = response.headers.get('content-type') || 'application/json'

          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', contentType)
          res.writeHead(response.status)
          res.end(text)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Proxy request failed', message }))
        }
      })
    },
  }
}
