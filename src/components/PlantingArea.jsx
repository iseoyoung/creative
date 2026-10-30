import { useEffect, useRef, useState } from 'react'
import FlowerGrowth from './FlowerGrowth.jsx'
import { STAGE_DURATIONS } from '../data/growth.js'

const stages = ['Stem', 'Leaves', 'Buds', 'Opening', 'Flowers']
const loadedSheets = new Map()
function loadSheet(source) {
  if (!loadedSheets.has(source)) {
    const image = new Image()
    image.src = source
    loadedSheets.set(source, image.decode().catch(error => {
      loadedSheets.delete(source)
      throw error
    }))
  }
  return loadedSheets.get(source)
}

export default function PlantingArea({ flower, onBloom, onRead, active }) {
  const [stage, setStage] = useState(-1)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const notified = useRef(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let cancelled = false
    loadSheet(flower.sheet).then(() => {
      if (!cancelled) { setReady(true); setFailed(false) }
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [flower.sheet, attempt])

  useEffect(() => {
    if (stage < 0 || stage === 4) return
    const timer = setTimeout(() => setStage(current => current + 1), reducedMotion ? 180 : STAGE_DURATIONS[stage])
    return () => clearTimeout(timer)
  }, [stage, reducedMotion])

  useEffect(() => {
    if (stage === 4 && !notified.current) {
      notified.current = true
      onBloom(flower.id)
    }
  }, [stage, flower.id, onBloom])

  const growing = stage >= 0 && stage < 4
  const label = failed ? `Retry loading ${flower.name}`
    : !ready ? `Loading ${flower.name}`
      : stage < 0 ? `Plant ${flower.name}`
        : growing ? `${flower.name}: ${stages[stage].toLowerCase()} growing`
          : `Read ${flower.name}`

  function handleClick() {
    if (failed) { setFailed(false); setAttempt(current => current + 1); return }
    if (stage < 0) setStage(0)
    else if (stage === 4) onRead(flower.id)
  }

  return (
    <section className={`planting-area${stage === 4 ? ' planting-area--bloomed' : ''}${active ? ' planting-area--active' : ''}`} aria-label={flower.name} data-stage={stage} data-flower={flower.id}>
      <button className="plant-button" onClick={handleClick} disabled={(!ready && !failed) || growing} aria-label={label}>
        <span className="plant-art" aria-hidden="true">
          {stage < 0 ? <span className="plant-marker">+</span> : (
            <span className="flower-sway">
              <FlowerGrowth flower={flower} />
            </span>
          )}
        </span>
        <span className="plant-label">{flower.name}</span>
        <span className="plant-hint">{failed ? 'Try again' : !ready ? 'Preparing…' : stage < 0 ? 'Plant a story' : growing ? 'Growing…' : 'Read the story'}</span>
      </button>
      <span className="sr-only" role="status">{stage < 0 ? '' : `${flower.name}: ${stages[stage]}${stage === 4 ? '. Ready to read.' : '.'}`}</span>
    </section>
  )
}
