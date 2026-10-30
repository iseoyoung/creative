import test from 'node:test'
import assert from 'node:assert/strict'
import { initialPetals, petalReducer } from '../src/data/petals.js'

const petal = (id, moment = 'lilac:comfort') => ({ id, mode: 'shared', response: { id: `answer-${id}`, moment } })

test('each answer stays available after landing without duplicates on refresh', () => {
  let state = initialPetals
  for (let id = 1; id <= 15; id++) state = petalReducer(state, { type: 'release', petal: petal(id) })
  assert.equal(state.active.length, 15)
  state = petalReducer(state, { type: 'land', id: 1 })
  assert.equal(state.active.length, 15)
  assert.equal(state.active[0].landed, true)
  assert.equal(petalReducer(state, { type: 'release', petal: { ...petal(1), id: 20 } }), state)
  assert.equal(petalReducer(state, { type: 'land', id: 1 }), state)
})

test('flower-specific answers remain distinct when they pile up', () => {
  let state = initialPetals
  for (const item of [petal(1), petal(2, 'carnations:gift'), petal(3, 'roses:love')]) state = petalReducer(state, { type: 'release', petal: item })
  state = petalReducer(state, { type: 'land', id: 2 })
  assert.deepEqual(state.active.map(item => item.response.moment), ['lilac:comfort', 'carnations:gift', 'roses:love'])
  assert.equal(state.active[1].landed, true)
  assert.equal(state.active[0].landed, undefined)
})

test('deleting one note removes only its petal from the ground', () => {
  let state = initialPetals
  for (const item of [petal(1), petal(2), petal(3, 'roses:love')]) state = petalReducer(state, { type: 'release', petal: item })
  state = petalReducer(state, { type: 'land', id: 2 })
  state = petalReducer(state, { type: 'delete', id: 2 })
  assert.deepEqual(state.active.map(item => item.id), [1, 3])
})
