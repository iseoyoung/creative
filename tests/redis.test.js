import test from 'node:test'
import assert from 'node:assert/strict'
import { RedisStore, configuredStore } from '../server/redis.js'

const row = { id: 'r1', moment: 'lilac:comfort', answer: 'A saved thought.', createdAt: '2026-10-30T12:00:00Z' }

test('Redis adapter sends atomic bounded saves and reads REST results', async () => {
  const commands = []
  const store = new RedisStore('https://redis.example.test', 'test-only-placeholder', async (url, options) => {
    assert.equal(new URL(url).protocol, 'https:')
    assert.equal(options.headers.Authorization, 'Bearer test-only-placeholder')
    const command = JSON.parse(options.body)
    commands.push(command)
    return { ok: true, json: async () => ({ result: command[0] === 'LRANGE' ? [JSON.stringify(row)] : 1 }) }
  })
  assert.equal(await store.save(row, 'hashed-client'), true)
  const saved = commands[0]
  assert.equal(saved[0], 'EVAL')
  assert.match(saved[1], /LTRIM/)
  assert.match(saved[1], /EXPIRE/)
  assert.equal(saved[2], 2)
  assert.equal(saved.at(-1), 200)
  const result = await store.list('lilac:comfort', 0, 12)
  assert.deepEqual(result.responses, [row])
  assert.equal(result.total, 1)
  assert.equal(result.nextOffset, null)
})

test('Redis adapter rejects failed HTTP and Redis errors', async () => {
  for (const response of [{ ok: false }, { ok: true, json: async () => ({ error: 'upstream detail' }) }]) {
    const store = new RedisStore('https://redis.example.test', 'test-only-placeholder', async () => response)
    await assert.rejects(store.list('lilac:comfort', 0, 12), /storage unavailable/)
  }
})

test('server configuration supports both Upstash and Vercel integration bindings', () => {
  assert.equal(configuredStore({}), null)
  assert.equal(configuredStore({ UPSTASH_REDIS_REST_URL: 'https://redis.example.test', KV_REST_API_TOKEN: 'test-only-placeholder' }), null)
  assert.ok(configuredStore({ UPSTASH_REDIS_REST_URL: 'https://redis.example.test', UPSTASH_REDIS_REST_TOKEN: 'test-only-placeholder' }))
  assert.ok(configuredStore({ KV_REST_API_URL: 'https://redis.example.test', KV_REST_API_TOKEN: 'test-only-placeholder' }))
  assert.throws(() => new RedisStore('http://redis.example.test', 'test-only-placeholder'))
})
