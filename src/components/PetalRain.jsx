import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { listResponses } from '../data/responses.js'
import FitToSpace from './FitToSpace.jsx'
import { initialPetals, petalReducer } from '../data/petals.js'
import { flowers } from '../data/flowers.js'
import { MAX_RESPONSES } from '../../shared/responses.js'

function PetalAnswer({ petal, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  // Ignore a delayed close event from Strict Mode's cleanup if already reopened.
  return (
    <dialog className="response-queue petal-answer" ref={dialog} aria-labelledby="petal-title" onClose={() => { if (!dialog.current?.open) onClose() }}>
      <header className="response-queue__header">
        <h2 id="petal-title">A passing thought</h2>
        <button className="icon-button" aria-label="Close petal answer" onClick={() => dialog.current.close()} autoFocus>×</button>
      </header>
      <p className="response-queue__question">{petal.question}</p>
      <p className="storage-note">{petal.mode === 'device' ? 'An answer saved on this device.' : 'An anonymous answer shared in this garden.'}</p>
      <div className="response-queue__body"><FitToSpace><blockquote className="queued-answer"><p>{petal.response.answer}</p></blockquote></FitToSpace></div>
    </dialog>
  )
}

function Petal({ petal, onLand, onRead, pileIndex }) {
  useEffect(() => {
    if (petal.landed) return
    // Keep the petal on the ground after its animation or reduced-motion delay.
    const cleanup = setTimeout(() => onLand(petal.id), petal.lifetime)
    return () => clearTimeout(cleanup)
  }, [petal.id, petal.lifetime, petal.landed, onLand])

  return (
    <button className={`falling-petal falling-petal--${petal.response.moment.split(':')[0]}${petal.landed ? ' falling-petal--landed' : ''}`} aria-label={petal.landed ? 'Read a thought on the ground' : 'Read a falling thought'} onClick={() => onRead(petal)} onAnimationEnd={event => { if (event.target === event.currentTarget) onLand(petal.id) }} style={{ left: `calc((100% - 2.75rem) * ${petal.left})`, animationDelay: `${petal.delay}ms`, '--drift': `${petal.drift}px`, '--fall-time': `${petal.duration}ms`, '--turn': `${petal.turn}deg`, '--pile-lift': `${Math.min(7, Math.floor(pileIndex / 5)) * 3}px` }}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path className="petal-shape" d="M8 5C25 0 46 11 39 29C35 39 24 45 19 44C16 34 3 22 8 5Z" />
        <path className="petal-vein" d="M12 10Q29 23 21 39M15 15Q29 17 34 23" fill="none" strokeWidth=".8" />
      </svg>
    </button>
  )
}

export default function PetalRain({ enabled }) {
  const [petals, dispatch] = useReducer(petalReducer, initialPetals)
  const [selected, setSelected] = useState(null)
  const cache = useRef(new Map())
  const [zones, setZones] = useState({})
  const reducedMotion = useRef(false)
  const counter = useRef(0)
  const active = useRef(enabled)
  active.current = enabled

  const remove = useCallback(id => dispatch({ type: 'land', id }), [])

  const release = useCallback((response, mode, prompt, delay = 0) => {
    if (!active.current) return
    const duration = 22000 + Math.round(Math.random() * 8000)
    const petal = {
      id: ++counter.current, response, mode, question: prompt,
      left: .3 + Math.random() * .4, drift: (Math.random() - .5) * 14, delay,
      turn: 70 + Math.random() * 170, duration,
      lifetime: reducedMotion.current ? 10000 : delay + duration + 500,
    }
    dispatch({ type: 'release', petal })
  }, [])

  useLayoutEffect(() => {
    function measure() {
      const next = {}
      for (const flower of flowers) {
        const area = document.querySelector(`[data-flower="${flower.id}"]`)
        const art = area?.querySelector('.plant-art')
        if (!area || !art) continue
        const rect = area.getBoundingClientRect()
        next[flower.id] = { left: rect.left, width: rect.width, height: art.getBoundingClientRect().bottom }
      }
      setZones(next)
    }
    const observer = new ResizeObserver(measure)
    document.querySelectorAll('.garden, .planting-area').forEach(element => observer.observe(element))
    window.addEventListener('resize', measure)
    measure()
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reducedMotion.current = media.matches }
    update()
    media.addEventListener('change', update)
    function submitted(event) {
      const { response, mode, question } = event.detail
      cache.current.set(`${mode}:${response.id}`, { response, mode, question })
      release(response, mode, question)
    }
    window.addEventListener('garden:response-sent', submitted)
    return () => {
      media.removeEventListener('change', update)
      window.removeEventListener('garden:response-sent', submitted)
    }
  }, [release])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    async function refresh() {
      await Promise.allSettled(flowers.flatMap(flower => flower.moments.map(async moment => {
        const key = `${flower.id}:${moment.id}`
        const previous = new Set([...cache.current].filter(([, saved]) => saved.response.moment === key).map(([id]) => id))
        const collected = new Map()
        let offset = 0
        do {
          const page = await listResponses(key, offset, controller.signal, MAX_RESPONSES)
          if (controller.signal.aborted) return
          for (const response of page.responses) collected.set(`${page.mode}:${response.id}`, { response, mode: page.mode, question: moment.question })
          offset = page.nextOffset
        } while (offset !== null)
        if (controller.signal.aborted) return
        // Merge, rather than erase a thought sent while this refresh was in flight.
        for (const id of previous) if (!collected.has(id)) cache.current.delete(id)
        for (const [id, saved] of collected) cache.current.set(id, saved)
      })))
    }
    function replay() {
      if (controller.signal.aborted || document.hidden || reducedMotion.current) return
      // Existing falling or landed answers are deduplicated by the reducer.
      for (const saved of cache.current.values()) {
        release(saved.response, saved.mode, saved.question, Math.round(Math.random() * 8000))
      }
    }
    let first
    refresh().then(() => { if (!controller.signal.aborted) first = setTimeout(replay, 4000) })
    const repeat = setInterval(replay, 40000)
    const refreshTimer = setInterval(refresh, 45000)
    return () => { controller.abort(); clearTimeout(first); clearInterval(repeat); clearInterval(refreshTimer) }
  }, [enabled, release])

  return (
    <>
      <div className="petal-rain" aria-label="Falling thoughts" aria-hidden={!enabled} inert={!enabled}>
        {flowers.map(flower => {
          const zone = zones[flower.id]
          if (!zone) return null
          return (
            <div className="petal-zone" key={flower.id} data-petal-zone={flower.id} aria-label={`${flower.name} thoughts`} style={{ left: zone.left, width: zone.width, height: zone.height, '--landing': `${Math.max(0, zone.height - 56)}px` }}>
              {petals.active.filter(petal => petal.response.moment.startsWith(`${flower.id}:`)).map((petal, index) => <Petal key={petal.id} petal={petal} onLand={remove} onRead={setSelected} pileIndex={index} />)}
            </div>
          )
        })}
      </div>
      {selected && <PetalAnswer petal={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
