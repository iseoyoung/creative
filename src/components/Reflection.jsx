import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MAX_ANSWER_LENGTH, answerError, normalizeAnswer } from '../../shared/responses.js'
import { listResponses, sendResponse } from '../data/responses.js'
import { SendIcon, QueueIcon } from './Icons.jsx'
import ResponseQueue from './ResponseQueue.jsx'

const draftKey = moment => `literary-garden:draft:v1:${moment}`
function readDraft(moment) {
  try { return localStorage.getItem(draftKey(moment)) || '' } catch { return '' }
}

export default function Reflection({ moment, question }) {
  const [answer, setAnswer] = useState(() => readDraft(moment))
  const [mode, setMode] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [queueOpen, setQueueOpen] = useState(false)
  const input = useRef(null)
  const mounted = useRef(true)
  const characterCount = [...answer].length
  const questionId = `question-${moment.replace(':', '-')}`

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    listResponses(moment, 0, controller.signal).then(page => {
      if (!controller.signal.aborted) setMode(page.mode)
    }).catch(() => { if (!controller.signal.aborted) setMode('unavailable') })
    return () => { mounted.current = false; controller.abort() }
  }, [moment])

  useLayoutEffect(() => {
    input.current.style.height = 'auto'
    input.current.style.height = `${Math.min(input.current.scrollHeight, 96)}px`
  }, [answer])

  function changeAnswer(value) {
    setAnswer(value)
    setError('')
    setStatus('')
    try { localStorage.setItem(draftKey(moment), value) } catch { /* Draft caching is optional. */ }
  }

  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const validation = answerError(answer)
    if (validation) { setError(validation); input.current.focus(); return }
    setPending(true)
    setError('')
    setStatus('')
    try {
      const result = await sendResponse(moment, normalizeAnswer(answer))
      window.dispatchEvent(new CustomEvent('garden:response-sent', { detail: { ...result, question } }))
      try { if (readDraft(moment) === answer) localStorage.removeItem(draftKey(moment)) } catch { /* Sending succeeded even if draft cleanup fails. */ }
      if (!mounted.current) return
      setMode(result.mode)
      setAnswer('')
      setStatus(result.mode === 'shared' ? 'Your thought has joined the garden.' : 'Your thought is saved on this device.')
    } catch (cause) { if (mounted.current) setError(cause.message) }
    finally { if (mounted.current) setPending(false) }
  }

  return (
    <section className="reflection" aria-labelledby={questionId}>
      <h3 id={questionId}>{question}</h3>
      <form className="reflection-form" onSubmit={submit}>
        <label className="sr-only" htmlFor={`answer-${questionId}`}>Your answer</label>
        <textarea id={`answer-${questionId}`} ref={input} rows="1" value={answer} onChange={event => changeAnswer(event.target.value)} placeholder="Leave a thought…" disabled={pending} aria-invalid={!!error} aria-describedby={`${questionId}-note ${questionId}-error`} />
        <div className="reflection-actions">
          <span className={`answer-count${characterCount > MAX_ANSWER_LENGTH ? ' answer-count--over' : ''}`}>{characterCount}/{MAX_ANSWER_LENGTH}</span>
          <button className="icon-button" type="submit" disabled={pending || !answer.trim() || characterCount > MAX_ANSWER_LENGTH} aria-label="Send answer" title="Send answer"><SendIcon /></button>
          <button className="icon-button" type="button" onClick={() => setQueueOpen(true)} aria-label="Open response queue" title="Read responses"><QueueIcon /></button>
        </div>
      </form>
      <p className="storage-note" id={`${questionId}-note`}>{mode === 'device' ? 'Answers are saved only on this device.' : mode === 'unavailable' ? 'The shared garden is temporarily unavailable.' : 'Your answer will be shared anonymously with other readers.'}</p>
      <p className="form-error" id={`${questionId}-error`} role={error ? 'alert' : undefined}>{error}</p>
      <p className="send-status" role="status">{pending ? 'Sending…' : status}</p>
      {queueOpen && <ResponseQueue moment={moment} question={question} onClose={() => setQueueOpen(false)} />}
    </section>
  )
}
