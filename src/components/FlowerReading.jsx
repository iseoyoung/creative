import { useEffect, useState } from 'react'

export default function FlowerReading({ flower }) {
  const [momentIndex, setMomentIndex] = useState(0)
  const [reveal, setReveal] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const moment = flower.moments[momentIndex]

  useEffect(() => {
    const timers = [setTimeout(() => setReveal(1), 900), setTimeout(() => setReveal(2), 1900)]
    return () => timers.forEach(clearTimeout)
  }, [momentIndex])

  function changeMoment(index) {
    setMomentIndex(index)
    setReveal(0)
    setExpanded(false)
  }

  return (
    <article className="flower-reading" aria-label={`${flower.name} reading`}>
      <h2 className="flower-reading__name"><img src={flower.nameImage} alt={flower.name} /></h2>
      {flower.moments.length > 1 && (
        <nav className="moment-picker" aria-label={`${flower.name} passages`}>
          {flower.moments.map((item, index) => (
            <button key={item.id} aria-pressed={momentIndex === index} onClick={() => changeMoment(index)}>
              <span className="moment-number">0{index + 1}</span> {item.title}
            </button>
          ))}
        </nav>
      )}
      <div key={moment.id} className="reading-passage">
        <div className={`reading-reveal${reveal >= 1 ? ' reading-reveal--visible' : ''}`} inert={reveal < 1} aria-hidden={reveal < 1}>
          <blockquote>
            {moment.sentence ? (
              <button className="quotation" aria-expanded={expanded} aria-controls={`sentence-${flower.id}-${moment.id}`} onClick={() => setExpanded(current => !current)}>
                <span id={`sentence-${flower.id}-${moment.id}`}>“{expanded ? moment.sentence : moment.excerpt}”</span>
                <span className="quotation__hint">{expanded ? 'Close full sentence −' : 'Read full sentence +'}</span>
              </button>
            ) : <p className="quotation">“{moment.excerpt}”</p>}
            <cite>Virginia Woolf · <span>Mrs. Dalloway</span></cite>
          </blockquote>
        </div>
        <div className={`reading-reveal reading-context${reveal >= 2 ? ' reading-reveal--visible' : ''}`} aria-hidden={reveal < 2}>
          <h3>In the story</h3>
          <p>{moment.context}</p>
        </div>
      </div>
    </article>
  )
}
