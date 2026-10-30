import { createHash, randomUUID } from 'node:crypto'
import { MOMENT_KEYS, RESPONSE_PAGE_SIZE, answerError, normalizeAnswer } from '../shared/responses.js'
import { configuredStore } from '../server/redis.js'

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) return req.body
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body) > 8192) throw new Error('Invalid body')
    return JSON.parse(req.body)
  }
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (Buffer.byteLength(body) > 8192) throw new Error('Invalid body')
  }
  return JSON.parse(body)
}

export function createResponseHandler({ getStore = configuredStore, now = () => new Date(), makeId = randomUUID } = {}) {
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    if (!['GET', 'POST'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST')
      return json(res, 405, { error: 'Method not allowed.' })
    }
    let body
    if (req.method === 'POST') {
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Use a JSON request.' })
      if (req.headers.origin) {
        try {
          if (new URL(req.headers.origin).host !== req.headers.host) return json(res, 403, { error: 'Request origin not allowed.' })
        } catch { return json(res, 403, { error: 'Request origin not allowed.' }) }
      }
      try { body = await readBody(req) } catch { return json(res, 400, { error: 'Invalid answer request.' }) }
    }
    const moment = req.method === 'GET' ? url.searchParams.get('moment') : body?.moment
    if (!MOMENT_KEYS.includes(moment)) return json(res, 400, { error: 'Unknown passage.' })
    if (req.method === 'POST') {
      const error = answerError(body.answer)
      if (error) return json(res, 400, { error })
    }
    const offset = Number(url.searchParams.get('offset') ?? 0)
    if (!Number.isInteger(offset) || offset < 0 || offset > 200) return json(res, 400, { error: 'Invalid page.' })
    const limit = Number(url.searchParams.get('limit') ?? RESPONSE_PAGE_SIZE)
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) return json(res, 400, { error: 'Invalid page size.' })
    try {
      const store = getStore()
      if (!store) return json(res, 503, { code: 'STORAGE_NOT_CONFIGURED', error: 'Shared responses are not connected yet.' })
      if (req.method === 'GET') return json(res, 200, { ...await store.list(moment, offset, limit), mode: 'shared' })
      const response = { id: makeId(), moment, answer: normalizeAnswer(body.answer), createdAt: now().toISOString() }
      // Keep raw IP addresses out of stored responses and rate-limit keys.
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
      const clientHash = createHash('sha256').update(ip).digest('hex').slice(0, 24)
      if (!await store.save(response, clientHash)) {
        res.setHeader('Retry-After', '60')
        return json(res, 429, { error: 'Please pause for a minute before sending another answer.' })
      }
      return json(res, 201, { response, mode: 'shared' })
    } catch {
      return json(res, 502, { error: 'Could not reach the shared garden. Please try again.' })
    }
  }
}

export default createResponseHandler()
