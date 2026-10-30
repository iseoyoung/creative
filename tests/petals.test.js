import test from 'node:test'
import assert from 'node:assert/strict'
import { initialPetals, petalReducer } from '../src/data/petals.js'

test('every submitted thought gets a petal without evicting petals before landing', () => {
  let state = initialPetals
  for (let id = 1; id <= 6; id++) state = petalReducer(state, { type: 'release', petal: { id } })
  assert.deepEqual(state.active.map(petal => petal.id), [1, 2, 3, 4])
  assert.deepEqual(state.waiting.map(petal => petal.id), [5, 6])
  state = petalReducer(state, { type: 'land', id: 2 })
  assert.deepEqual(state.active.map(petal => petal.id), [1, 3, 4, 5])
  assert.deepEqual(state.waiting.map(petal => petal.id), [6])
  const unchanged = petalReducer(state, { type: 'land', id: 2 })
  assert.equal(unchanged, state)
  for (const id of [1, 3, 4, 5, 6]) state = petalReducer(state, { type: 'land', id })
  assert.deepEqual(state, initialPetals)
})
