import test from 'node:test'
import assert from 'node:assert/strict'
import { initialPetals, petalReducer } from '../src/data/petals.js'

const petal = (id, moment = 'lilac:comfort') => ({ id, mode: 'shared', response: { id: `answer-${id}`, moment } })

test('every saved answer has one active petal without a four-petal cap', () => {
  let state = initialPetals
  for (let id = 1; id <= 15; id++) state = petalReducer(state, { type: 'release', petal: petal(id) })
  assert.equal(state.active.length, 15)
  assert.equal(state.waiting.length, 0)
  assert.equal(petalReducer(state, { type: 'release', petal: { ...petal(1), id: 20 } }), state)
  state = petalReducer(state, { type: 'land', id: 1 })
  assert.equal(state.active.length, 14)
  state = petalReducer(state, { type: 'release', petal: { ...petal(1), id: 21 } })
  assert.equal(state.active.length, 15)
})

test('different flower answers retain their identity and land independently', () => {
  let state = initialPetals
  for (const item of [petal(1), petal(2, 'carnations:gift'), petal(3, 'roses:love')]) state = petalReducer(state, { type: 'release', petal: item })
  state = petalReducer(state, { type: 'land', id: 2 })
  assert.deepEqual(state.active.map(item => item.response.moment), ['lilac:comfort', 'roses:love'])
  assert.equal(petalReducer(state, { type: 'land', id: 2 }), state)
})
