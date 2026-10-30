import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { listResponses } from '../data/responses.js'
import FitToSpace from './FitToSpace.jsx'
import { initialPetals, petalReducer } from '../data/petals.js'

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

function Petal({ petal, onLand, onRead }) {
  useEffect(() => {
    // Animation completion handles normal landings; this also cleans up when
    // reduced motion is enabled or a browser suspends an animation.
    const cleanup = setTimeout(() => onLand(petal.id), petal.lifetime)
    return () => clearTimeout(cleanup)
  }, [petal.id, petal.lifetime, onLand])

  return (
    <button className={`falling-petal falling-petal--${petal.response.moment.split(':')[0]}`} aria-label="Read a falling thought" onClick={() => onRead(petal)} onAnimationEnd={event => { if (event.target === event.currentTarget) onLand(petal.id) }} style={{ left: `${petal.left}%`, '--drift': `${petal.drift}px`, '--fall-time': `${petal.duration}ms`, '--turn': `${petal.turn}deg` }}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path className="petal-shape" d="M8 5C25 0 46 11 39 29C35 39 24 45 19 44C16 34 3 22 8 5Z" />
        <path className="petal-vein" d="M12 10Q29 23 21 39M15 15Q29 17 34 23" fill="none" strokeWidth=".8" />
      </svg>
    </button>
  )
}

export default function PetalRain({ moment, question, enabled }) {
  const [petals, dispatch] = useReducer(petalReducer, initialPetals)
  const [selected, setSelected] = useState(null)
  const cache = useRef({ responses: [], mode: null, question: '' })
  const reducedMotion = useRef(false)
  const counter = useRef(0)
  const active = useRef(enabled)
  active.current = enabled

  const remove = useCallback(id => dispatch({ type: 'land', id }), [])

  const release = useCallback((response, mode, prompt) => {
    if (!active.current) return
    const duration = 22000 + Math.round(Math.random() * 8000)
    const petal = {
      id: ++counter.current, response, mode, question: prompt,
      left: 8 + Math.random() * 84, drift: (Math.random() - .5) * 100,
      turn: 70 + Math.random() * 170, duration,
      lifetime: reducedMotion.current ? 10000 : duration + 500,
    }
    dispatch({ type: 'release', petal })
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reducedMotion.current = media.matches }
    update()
    media.addEventListener('change', update)
    function submitted(event) {
      const { response, mode, question: prompt } = event.detail
      release(response, mode, prompt)
      if (response.moment === moment) {
        cache.current.responses = [response, ...cache.current.responses.filter(item => item.id !== response.id)]
        cache.current.mode = mode
      }
    }
    window.addEventListener('garden:response-sent', submitted)
    return () => {
      media.removeEventListener('change', update)
      window.removeEventListener('garden:response-sent', submitted)
    }
  }, [moment, release])

  useEffect(() => {
    cache.current = { responses: [], mode: null, question }
    if (!enabled || !moment) return
    const controller = new AbortController()
    async function refresh() {
      try {
        const result = await listResponses(moment, 0, controller.signal)
        if (!controller.signal.aborted) cache.current = { responses: result.responses, mode: result.mode, question }
      } catch { /* Keep existing petals and retry on the next scheduled refresh. */ }
    }
    function replay() {
      if (document.hidden || reducedMotion.current) return
      const saved = cache.current
      if (!saved.responses.length) return
      const response = saved.responses[Math.floor(Math.random() * saved.responses.length)]
      release(response, saved.mode, saved.question)
    }
    refresh()
    const first = setTimeout(replay, 4000)
    const repeat = setInterval(replay, 11000)
    const refreshTimer = setInterval(refresh, 45000)
    return () => { controller.abort(); clearTimeout(first); clearInterval(repeat); clearInterval(refreshTimer) }
  }, [enabled, moment, question, release])

  return (
    <>
      <div className="petal-rain" aria-label="Falling thoughts" aria-hidden={!enabled} inert={!enabled}>
        {petals.active.map(petal => <Petal key={petal.id} petal={petal} onLand={remove} onRead={setSelected} />)}
      </div>
      {selected && <PetalAnswer petal={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
