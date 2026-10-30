export const initialPetals = { active: [], waiting: [] }

export function petalReducer(state, action) {
  if (action.type === 'release') {
    const incoming = action.petal
    const duplicate = state.active.some(petal => petal.mode === incoming.mode && petal.response.id === incoming.response.id)
    return duplicate ? state : { ...state, active: [...state.active, incoming] }
  }
  if (action.type === 'land') {
    if (!state.active.some(petal => petal.id === action.id)) return state
    return { ...state, active: state.active.filter(petal => petal.id !== action.id) }
  }
  return state
}
