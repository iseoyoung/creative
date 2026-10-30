import { useId, useState } from 'react'

const names = {
  lilac: /(\blilacs?\b)/gi,
  carnations: /(\bcarnations?\b)/gi,
  roses: /(\broses?\b)/gi,
}

export default function FlowerQuote({ sentence, excerpt, flowerId }) {
  const [expanded, setExpanded] = useState(false)
  const textId = useId()
  const text = expanded ? sentence : excerpt
  const expression = names[flowerId]
  const parts = text.split(expression)

  return (
    <button className="quotation" aria-expanded={expanded} aria-controls={textId} onClick={() => setExpanded(value => !value)}>
      <span id={textId}>“{parts.map((part, index) => index % 2
        ? <span className={`quotation-flower quotation-flower--${flowerId}`} key={index}>{part}</span>
        : part)}”</span>
      <span className="quotation__hint">{expanded ? 'Close full quotation −' : 'Read full quotation +'}</span>
    </button>
  )
}
