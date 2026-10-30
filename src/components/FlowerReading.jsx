import { useEffect, useRef, useState } from 'react'
import Reflection from './Reflection.jsx'
import FlowerQuote from './FlowerQuote.jsx'
import { readingQuestions } from '../data/flowers.js'

export default function FlowerReading({ flower }) {
  const [momentIndex, setMomentIndex] = useState(0)
  const [reveal, setReveal] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const quotationScroll = useRef(null)
  const moment = flower.moments[momentIndex]
  const questions = readingQuestions(moment)
  const selectedQuestion = questions[questionIndex]


  useEffect(() => {
    const timers = [setTimeout(() => setReveal(1), 900), setTimeout(() => setReveal(2), 1900), setTimeout(() => setReveal(3), 2900)]
    return () => timers.forEach(clearTimeout)
  }, [momentIndex])

  function changeMoment(index) {
    if (index === momentIndex) return
    setMomentIndex(index)
    setReveal(0)
    setExpanded(false)
    setQuestionIndex(0)
  }

  function toggleQuotation() {
    setExpanded(value => !value)
    quotationScroll.current?.scrollTo({ top: 0 })
  }

  return (
    <article className="flower-reading" aria-label={`${flower.name} reading`}>
      <div className="reading-literature">
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
          <div className={`quotation-section reading-reveal${reveal >= 1 ? ' reading-reveal--visible' : ''}`} aria-hidden={reveal < 1}>
            <blockquote>
              <div className={`quotation-scroll${expanded ? '' : ' quotation-scroll--short'}`} id={`quotation-${flower.id}-${moment.id}`} ref={quotationScroll} role="region" aria-label={expanded ? 'Expanded quotation' : 'Short quotation'} tabIndex={reveal >= 1 ? 0 : -1}>
                <FlowerQuote text={expanded ? moment.sentence : moment.excerpt} flowerId={flower.id} fitToPanel={!expanded} />
              </div>
              <div className="quotation-meta">
                <button className="quotation-expand" aria-expanded={expanded} aria-controls={`quotation-${flower.id}-${moment.id}`} onClick={toggleQuotation} disabled={reveal < 1}>{expanded ? 'Collapse −' : 'Expand +'}</button>
              </div>
            </blockquote>
          </div>
          <div className={`reading-reveal reading-context${reveal >= 2 ? ' reading-reveal--visible' : ''}`} aria-hidden={reveal < 2}>
            <h3>In the story</h3>
            <div className="context-scroll" role="region" aria-label="Story context" tabIndex={reveal >= 2 ? 0 : -1}>
              {moment.context.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </div>
      <div className={`reflection-wrap reading-reveal${reveal >= 3 ? ' reading-reveal--visible' : ''}`} inert={reveal < 3} aria-hidden={reveal < 3}>
        {questions.length > 1 && <nav className="reflection-question-picker" aria-label="Reflection questions">
          {questions.map((question, index) => <button key={question.id} aria-pressed={questionIndex === index} onClick={() => setQuestionIndex(index)}>Question {index + 1}</button>)}
        </nav>}
        <Reflection key={selectedQuestion.id} moment={`${flower.id}:${selectedQuestion.id}`} question={selectedQuestion.question} />
      </div>
    </article>
  )
}
