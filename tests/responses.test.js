import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { createResponseHandler } from '../api/responses.js'
import { MAX_ANSWER_LENGTH, normalizeAnswer, answerError } from '../shared/responses.js'

async function call(handler, { method = 'GET', url = '/api/responses?moment=lilac:comfort', body, headers = {} } = {}) {
  const req = Readable.from(body === undefined ? [] : [typeof body === 'string' ? body : JSON.stringify(body)])
  req.method = method
  req.url = url
  req.headers = { host: 'garden.test', ...(method === 'POST' ? { 'content-type': 'application/json' } : {}), ...headers }
  req.socket = { remoteAddress: '127.0.0.1' }
  const responseHeaders = {}
  let result
  const res = { setHeader: (key, value) => { responseHeaders[key] = value }, end: text => { result = JSON.parse(text) } }
  await handler(req, res)
  return { status: res.statusCode, headers: responseHeaders, body: result }
}

function garden() {
  const rows = []
  let saves = 0
  const hashes = []
  const store = {
    async list(moment, offset, limit) {
      const values = rows.filter(row => row.moment === moment)
      return { responses: values.slice(offset, offset + limit), total: values.length, nextOffset: offset + limit < values.length ? offset + limit : null }
    },
    async save(value, hash) { hashes.push(hash); if (++saves > 5) return false; rows.unshift(value); return true },
  }
  return { rows, hashes, handler: createResponseHandler({ getStore: () => store, now: () => new Date('2026-10-30T12:00:00Z') }) }
}

test('a shared answer persists and is returned only for its own passage', async () => {
  const { handler, hashes } = garden()
  const posted = await call(handler, { method: 'POST', body: { moment: 'lilac:comfort', answer: '  A quiet moment.  ' } })
  assert.equal(posted.status, 201)
  assert.equal(posted.body.response.answer, 'A quiet moment.')
  assert.equal(posted.body.mode, 'shared')
  assert.ok(posted.body.response.id)
  const read = await call(handler)
  assert.deepEqual(read.body.responses, [posted.body.response])
  assert.equal(read.headers['Cache-Control'], 'no-store')
  assert.equal((await call(handler, { url: '/api/responses?moment=roses:love' })).body.total, 0)
  assert.match(hashes[0], /^[a-f0-9]{24}$/)
  assert.ok(!JSON.stringify(read.body).includes('127.0.0.1'))
})

test('invalid answers, passage identifiers, request bodies, and origins never reach storage', async () => {
  const { handler, rows } = garden()
  for (const body of [{ moment: 'bad', answer: 'Hello' }, { moment: 'lilac:comfort', answer: '  ' }, { moment: 'lilac:comfort', answer: 'x'.repeat(MAX_ANSWER_LENGTH + 1) }, { moment: 'lilac:comfort', answer: '\u0000hello' }]) {
    assert.equal((await call(handler, { method: 'POST', body })).status, 400)
  }
  assert.equal((await call(handler, { method: 'POST', body: '{invalid' })).status, 400)
  assert.equal((await call(handler, { method: 'POST', body: {}, headers: { 'content-type': 'text/plain' } })).status, 415)
  assert.equal((await call(handler, { method: 'POST', body: { moment: 'lilac:comfort', answer: 'Hello' }, headers: { origin: 'https://elsewhere.test' } })).status, 403)
  assert.equal((await call(handler, { url: '/api/responses?moment=lilac:comfort&offset=-1' })).status, 400)
  assert.equal((await call(handler, { url: '/api/responses?moment=lilac:comfort&limit=201' })).status, 400)
  assert.equal(rows.length, 0)
})

test('server rate limit returns Retry-After without storing the sixth answer', async () => {
  const { handler, rows } = garden()
  for (let i = 0; i < 5; i++) assert.equal((await call(handler, { method: 'POST', body: { moment: 'lilac:comfort', answer: `Thought ${i}` } })).status, 201)
  const result = await call(handler, { method: 'POST', body: { moment: 'lilac:comfort', answer: 'Too soon' } })
  assert.equal(result.status, 429)
  assert.equal(result.headers['Retry-After'], '60')
  assert.equal(rows.length, 5)
})

test('pagination returns the next page without repeating the first page', async () => {
  const { handler, rows } = garden()
  for (let i = 0; i < 15; i++) rows.push({ id: String(i), moment: 'lilac:comfort', answer: `Thought ${i}`, createdAt: '2026-10-30T12:00:00Z' })
  const first = (await call(handler)).body
  assert.equal(first.responses.length, 12)
  assert.equal(first.nextOffset, 12)
  const second = (await call(handler, { url: '/api/responses?moment=lilac:comfort&offset=12' })).body
  assert.equal(second.responses.length, 3)
  assert.equal(second.nextOffset, null)
  assert.ok(!first.responses.some(a => second.responses.some(b => a.id === b.id)))
  const all = (await call(handler, { url: '/api/responses?moment=lilac:comfort&limit=200' })).body
  assert.equal(all.responses.length, 15)
  assert.equal(all.nextOffset, null)
})

test('unconfigured storage is distinct from a failed upstream operation', async () => {
  const missing = await call(createResponseHandler({ getStore: () => null }))
  assert.equal(missing.status, 503)
  assert.equal(missing.body.code, 'STORAGE_NOT_CONFIGURED')
  const failed = await call(createResponseHandler({ getStore: () => ({ list: () => { throw new Error('private server detail') } }) }))
  assert.equal(failed.status, 502)
  assert.ok(!JSON.stringify(failed.body).includes('private server detail'))
})

test('answer length counts Unicode characters and normalizes line breaks', () => {
  assert.equal(answerError('🌷'.repeat(MAX_ANSWER_LENGTH)), null)
  assert.ok(answerError('🌷'.repeat(MAX_ANSWER_LENGTH + 1)))
  assert.equal(normalizeAnswer('  A\r\nthought. '), 'A\nthought.')
})
