import { useLayoutEffect, useRef } from 'react'

const names = {
  lilac: /(\blilacs?\b)/gi,
  carnations: /(\bcarnations?\b)/gi,
  roses: /(\broses?\b)/gi,
}

export default function FlowerQuote({ text, flowerId, fitToPanel = false }) {
  const quote = useRef(null)
  const paragraphs = text.split('\n\n')

  useLayoutEffect(() => {
    const element = quote.current
    const panel = element.parentElement
    let cancelled = false
    function fit() {
      element.style.fontSize = ''
      if (!fitToPanel) return
      const style = getComputedStyle(panel)
      const available = panel.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      if (available <= 0) return
      let low = 1
      let high = parseFloat(getComputedStyle(element).fontSize)
      if (element.getBoundingClientRect().height <= available) return
      for (let i = 0; i < 12; i++) {
        const size = (low + high) / 2
        element.style.fontSize = `${size}px`
        if (element.getBoundingClientRect().height <= available) low = size
        else high = size
      }
      element.style.fontSize = `${low}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(panel)
    document.fonts.ready.then(() => { if (!cancelled) fit() })
    return () => { cancelled = true; observer.disconnect(); element.style.fontSize = '' }
  }, [text, fitToPanel])

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
