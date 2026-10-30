const names = {
  lilac: /(\blilacs?\b)/gi,
  carnations: /(\bcarnations?\b)/gi,
  roses: /(\broses?\b)/gi,
}

export default function FlowerQuote({ text, flowerId }) {
  const paragraphs = text.split('\n\n')
  return (
    <div className="quotation">
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
