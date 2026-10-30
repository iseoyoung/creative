import { MAX_RESPONSES, isResponse } from '../shared/responses.js'

const SAVE_RESPONSE = `
local attempts = redis.call('INCR', KEYS[2])
if attempts == 1 then redis.call('EXPIRE', KEYS[2], 60) end
if attempts > 5 then return 0 end
redis.call('LPUSH', KEYS[1], ARGV[1])
redis.call('LTRIM', KEYS[1], 0, tonumber(ARGV[2]) - 1)
return 1
`

export class RedisStore {
  constructor(url, token, request = fetch) {
    const endpoint = new URL(url)
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('Invalid Redis endpoint')
    this.url = endpoint.href
    this.token = token
    this.request = request
  }

  async command(command) {
    const response = await this.request(this.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('Response storage unavailable')
    const body = await response.json()
    if (body.error) throw new Error('Response storage unavailable')
    return body.result
  }

  async list(moment, offset, limit) {
    const key = `creative:responses:${moment}`
    const [rows, total] = await Promise.all([
      this.command(['LRANGE', key, offset, offset + limit - 1]),
      this.command(['LLEN', key]),
    ])
    const responses = rows.flatMap(row => {
      try { const value = JSON.parse(row); return isResponse(value) ? [value] : [] } catch { return [] }
    })
    return { responses, total, nextOffset: offset + rows.length < total ? offset + rows.length : null }
  }

  async save(response, clientHash) {
    const result = await this.command([
      'EVAL', SAVE_RESPONSE, 2, `creative:responses:${response.moment}`,
      `creative:response-limit:${clientHash}`, JSON.stringify(response), MAX_RESPONSES,
    ])
    return result === 1
  }
}

export function configuredStore(environment = process.env) {
  if (environment.UPSTASH_REDIS_REST_URL && environment.UPSTASH_REDIS_REST_TOKEN) {
    return new RedisStore(environment.UPSTASH_REDIS_REST_URL, environment.UPSTASH_REDIS_REST_TOKEN)
  }
  if (environment.KV_REST_API_URL && environment.KV_REST_API_TOKEN) {
    return new RedisStore(environment.KV_REST_API_URL, environment.KV_REST_API_TOKEN)
  }
  return null
}
