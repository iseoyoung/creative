import { useEffect, useRef, useState } from 'react'
import { RESPONSE_PAGE_SIZE } from '../../shared/responses.js'
import { listResponses } from '../data/responses.js'
import FitToSpace from './FitToSpace.jsx'

export default function ResponseQueue({ moment, question, onClose }) {
  const dialog = useRef(null)
  const requestController = useRef(null)
  const [page, setPage] = useState({ responses: [], total: 0, nextOffset: null, offset: 0, mode: null })
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(offset = 0, last = false) {
    requestController.current?.abort()
    const controller = new AbortController()
    requestController.current = controller
    setLoading(true)
    setError('')
    try {
      const result = await listResponses(moment, offset, controller.signal)
      if (controller.signal.aborted) return
      setPage({ ...result, offset })
      setIndex(last ? Math.max(0, result.responses.length - 1) : 0)
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause.message)
    } finally { if (!controller.signal.aborted) setLoading(false) }
  }

  useEffect(() => {
    const element = dialog.current
    element.showModal()
    load()
    return () => { requestController.current?.abort(); element.close() }
    // Each mounted queue belongs to one passage; request cleanup is per dialog.
  }, [])

  const current = page.responses[index]
  const position = page.offset + index + 1

  return (
    <dialog className="response-queue" ref={dialog} aria-labelledby="queue-title" onClose={() => { if (!dialog.current?.open) onClose() }}>
      <header className="response-queue__header">
        <h2 id="queue-title">{page.mode === 'device' ? 'Your saved thoughts' : 'Other readers’ thoughts'}</h2>
        <button className="icon-button" aria-label="Close response queue" onClick={() => dialog.current.close()} autoFocus>×</button>
      </header>
      <p className="response-queue__question">{question}</p>
      <p className="storage-note">{page.mode === 'device' ? 'Only answers saved on this device are shown.' : page.mode === 'shared' ? 'Anonymous thoughts shared in this garden.' : 'Opening the queue…'}</p>
      <div className="response-queue__body" aria-live="polite" aria-busy={loading}>
        <FitToSpace>
          {loading ? <p>Gathering thoughts…</p>
            : error ? <p className="form-error" role="alert">{error}</p>
              : current ? <blockquote className="queued-answer"><p>{current.answer}</p><cite>{page.mode === 'device' ? 'You · this device' : 'A reader'}</cite></blockquote>
                : <p>{page.mode === 'device' ? 'Your saved answers will appear here.' : 'No answers yet. You can leave the first thought.'}</p>}
        </FitToSpace>
      </div>
      <footer className="response-queue__footer">
        <button disabled={loading || (!page.offset && !index)} onClick={() => index ? setIndex(value => value - 1) : load(Math.max(0, page.offset - RESPONSE_PAGE_SIZE), true)} aria-label="Previous response">←</button>
        <span>{current ? `${position} / ${page.total}` : '0 thoughts'}</span>
        <button disabled={loading || (!page.nextOffset && index >= page.responses.length - 1)} onClick={() => index + 1 < page.responses.length ? setIndex(value => value + 1) : load(page.nextOffset)} aria-label="Next response">→</button>
        <button className="queue-refresh" disabled={loading} onClick={() => load()}>Refresh</button>
      </footer>
    </dialog>
  )
}
