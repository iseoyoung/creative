import { useLayoutEffect, useRef } from 'react'

const names = {
  lilac: /(\blilacs?\b)/gi,
  carnations: /(\bcarnations?\b)/gi,
  roses: /(\broses?\b)/gi,
}

export default function FlowerQuote({ text, flowerId, fitToPanel = false, shortText = text }) {
  const quote = useRef(null)
  const paragraphs = text.split('\n\n')

  useLayoutEffect(() => {
    const element = quote.current
    const panel = element.parentElement
    let cancelled = false
    function fit() {
      element.style.fontSize = ''
      if (!fitToPanel) return
      const measurement = element.cloneNode(true)
      measurement.replaceChildren()
      measurement.append('“')
      shortText.split(names[flowerId]).forEach((part, index) => {
        if (index % 2) {
          const highlight = document.createElement('span')
          highlight.className = `quotation-flower quotation-flower--${flowerId}`
          highlight.textContent = part
          measurement.append(highlight)
        } else measurement.append(part)
      })
      measurement.append('”')
      Object.assign(measurement.style, { position: 'fixed', visibility: 'hidden', width: `${element.getBoundingClientRect().width}px`, pointerEvents: 'none' })
      document.body.append(measurement)
      const style = getComputedStyle(panel)
      const available = panel.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      if (available <= 0) { measurement.remove(); return }
      let low = 1
      let high = parseFloat(getComputedStyle(element).fontSize)
      if (measurement.getBoundingClientRect().height <= available) { measurement.remove(); return }
      for (let i = 0; i < 12; i++) {
        const size = (low + high) / 2
        measurement.style.fontSize = `${size}px`
        if (measurement.getBoundingClientRect().height <= available) low = size
        else high = size
      }
      element.style.fontSize = `${low}px`
      measurement.remove()
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(panel)
    document.fonts.ready.then(() => { if (!cancelled) fit() })
    return () => { cancelled = true; observer.disconnect(); element.style.fontSize = '' }
  }, [text, shortText, flowerId, fitToPanel])

  return (
    <div className="quotation" ref={quote}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p className="quotation-paragraph" key={paragraphIndex}>
          {paragraphIndex === 0 ? '“' : ''}
          {paragraph.split(names[flowerId]).map((part, index) => index % 2
            ? <span className={`quotation-flower quotation-flower--${flowerId}`} key={index}>{part}</span>
            : part)}
          {paragraphIndex === paragraphs.length - 1 ? '”' : ''}
        </p>
      ))}
    </div>
  )
}
