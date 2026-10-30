import { useEffect, useRef, useState } from 'react'
import titleImage from './title.png'
import gardenImage from './background.png'

const flowers = ['Lilac', 'Carnations', 'Roses']

export default function App() {
  const [entered, setEntered] = useState(false)
  const gardenScene = useRef(null)

  useEffect(() => {
    if (entered) gardenScene.current?.focus({ preventScroll: true })
  }, [entered])

  return (
    <main className="experience">
      <section
        className="garden"
        aria-label="Literary Garden"
        ref={gardenScene}
        tabIndex={-1}
        aria-hidden={!entered}
        inert={!entered}
        style={{ backgroundImage: `url("${gardenImage}")` }}
      >
        <div className="planting-areas" aria-label="Three planting areas">
          {flowers.map((flower, index) => (
            <section className="planting-area" key={flower} aria-labelledby={`flower-${index}`}>
              <div className="planting-area__space" aria-hidden="true" />
              <h2 id={`flower-${index}`}>{flower}</h2>
            </section>
          ))}
        </div>
      </section>
      <section
        className={`title-screen${entered ? ' title-screen--dismissed' : ''}`}
        aria-labelledby="title-heading"
        aria-hidden={entered}
        inert={entered}
        style={{ backgroundImage: `url("${titleImage}")` }}
      >
        <div className="title-screen__content">
          <p className="eyebrow">Words take root here</p>
          <h1 id="title-heading">Literary<br /><em>Garden</em></h1>
          <p className="title-screen__description">A space for stories to grow.</p>
          <button className="enter-button" onClick={() => setEntered(true)}>
            Enter the garden <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>
    </main>
  )
}
