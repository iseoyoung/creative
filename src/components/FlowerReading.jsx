import { useEffect, useState } from 'react'
import Reflection from './Reflection.jsx'
import FitToSpace from './FitToSpace.jsx'
import FlowerQuote from './FlowerQuote.jsx'

export default function FlowerReading({ flower }) {
  const [momentIndex, setMomentIndex] = useState(0)
  const [reveal, setReveal] = useState(0)
  const moment = flower.moments[momentIndex]


  useEffect(() => {
    const timers = [setTimeout(() => setReveal(1), 900), setTimeout(() => setReveal(2), 1900), setTimeout(() => setReveal(3), 2900)]
    return () => timers.forEach(clearTimeout)
  }, [momentIndex])

  function changeMoment(index) {
    if (index === momentIndex) return
    setMomentIndex(index)
    setReveal(0)
  }

  return (
    <article className="flower-reading" aria-label={`${flower.name} reading`}>
      <div className="reading-literature">
        <FitToSpace>
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
            <div className={`reading-reveal${reveal >= 1 ? ' reading-reveal--visible' : ''}`} aria-hidden={reveal < 1}>
              <blockquote>
                <FlowerQuote key={moment.id} sentence={moment.sentence} excerpt={moment.excerpt} flowerId={flower.id} />
                <cite>Virginia Woolf · <span>Mrs. Dalloway</span></cite>
              </blockquote>
            </div>
            <div className={`reading-reveal reading-context${reveal >= 2 ? ' reading-reveal--visible' : ''}`} aria-hidden={reveal < 2}>
              <h3>In the story</h3>
              <p>{moment.context}</p>
            </div>
          </div>
        </FitToSpace>
      </div>
      <div className={`reflection-wrap reading-reveal${reveal >= 3 ? ' reading-reveal--visible' : ''}`} inert={reveal < 3} aria-hidden={reveal < 3}>
        <Reflection key={moment.id} moment={`${flower.id}:${moment.id}`} question={moment.question} />
      </div>
    </article>
  )
}
