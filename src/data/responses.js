import { MAX_RESPONSES, RESPONSE_PAGE_SIZE, isResponse } from '../../shared/responses.js'

const storageKey = moment => `literary-garden:responses:v1:${moment}`

function deviceResponses(moment) {
  const saved = localStorage.getItem(storageKey(moment))
  if (!saved) return []
  let values
  try { values = JSON.parse(saved) } catch { throw new Error('Could not read saved answers on this device.') }
  if (!Array.isArray(values)) throw new Error('Could not read saved answers on this device.')
  return values.filter(value => isResponse(value) && value.moment === moment)
}

async function request(url, options = {}) {
  let response
  try {
    const timeout = AbortSignal.timeout(10000)
    response = await fetch(url, { ...options, signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout })
  }
  catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Could not reach the garden. Please try again.')
  }
  const isJson = response.headers.get('content-type')?.includes('application/json')
  // An unconfigured deployment or plain Vite preview can still store this
  // visitor's own answers locally. Never label them as other readers' answers.
  if (response.status === 404 || (response.ok && !isJson)) return null
  if (!isJson) throw new Error('The garden is temporarily unavailable. Please try again.')
  const body = await response.json()
  if (response.status === 503 && body.code === 'STORAGE_NOT_CONFIGURED') return null
  if (!response.ok) throw new Error(body.error || 'Could not send your answer. Please try again.')
  return body
}

export async function listResponses(moment, offset = 0, signal, limit = RESPONSE_PAGE_SIZE) {
  const shared = await request(`/api/responses?moment=${encodeURIComponent(moment)}&offset=${offset}&limit=${limit}`, { signal })
  if (shared) return shared
  const responses = deviceResponses(moment)
  return { mode: 'device', responses: responses.slice(offset, offset + limit), total: responses.length, nextOffset: offset + limit < responses.length ? offset + limit : null }
}

export async function sendResponse(moment, answer) {
  const shared = await request('/api/responses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moment, answer }) })
  if (shared) return shared
  const response = { id: crypto.randomUUID(), moment, answer, createdAt: new Date().toISOString() }
  const saved = [response, ...deviceResponses(moment)].slice(0, MAX_RESPONSES)
  try { localStorage.setItem(storageKey(moment), JSON.stringify(saved)) }
  catch { throw new Error('Could not save your answer on this device. Please keep your text and try again.') }
  return { response, mode: 'device' }
}
