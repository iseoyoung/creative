export const initialPetals = { active: [], waiting: [] }

// Submitted thoughts wait their turn instead of making an existing petal vanish.
export function petalReducer(state, action) {
  if (action.type === 'release') {
    return state.active.length < 4
      ? { ...state, active: [...state.active, action.petal] }
      : { ...state, waiting: [...state.waiting, action.petal] }
  }
  if (action.type === 'land') {
    if (!state.active.some(petal => petal.id === action.id)) return state
    const active = state.active.filter(petal => petal.id !== action.id)
    return state.waiting.length
      ? { active: [...active, state.waiting[0]], waiting: state.waiting.slice(1) }
      : { ...state, active }
  }
  return state
}
