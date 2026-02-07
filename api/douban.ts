import type { VercelRequest, VercelResponse } from '@vercel/node'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { kind, category, type, limit, start, tag, sort } = req.query

    if (!kind || typeof kind !== 'string') {
      return res.status(400).json({ error: 'Kind parameter is required' })
    }

    const params = new URLSearchParams()
    params.append('type', kind)

    if (tag && typeof tag === 'string') {
      params.append('tag', tag)
    } else if (category && typeof category === 'string') {
      params.append('tag', category)
    }

    if (limit) {
      params.append('page_limit', String(limit))
    }

    if (start) {
      params.append('page_start', String(start))
    }

    if (sort && typeof sort === 'string') {
      params.append('sort', sort)
    }

    const response = await handleDoubanRequest('/search_subjects', params)
    const data = await response.json()

    const transformedData = {
      code: 200,
      message: 'success',
      list: data.subjects.map((item: any) => ({
        id: item.id,
        title: item.title,
        poster: item.cover,
        rate: item.rate,
        year: item.year || '',
      })),
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).json(transformedData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to fetch douban data', message })
  }
}