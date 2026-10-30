const names = {
  lilac: /(\blilacs?\b)/gi,
  carnations: /(\bcarnations?\b)/gi,
  roses: /(\broses?\b)/gi,
}

export default function FlowerQuote({ sentence, flowerId }) {
  const parts = sentence.split(names[flowerId])
  return (
    <p className="quotation">“{parts.map((part, index) => index % 2
      ? <span className={`quotation-flower quotation-flower--${flowerId}`} key={index}>{part}</span>
      : part)}”</p>
  )
}
