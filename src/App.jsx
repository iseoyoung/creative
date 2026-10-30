import { useEffect, useRef, useState } from 'react'
import titleImage from './title.png'
import gardenImage from './background.png'
import { flowers } from './data/flowers.js'
import PlantingArea from './components/PlantingArea.jsx'
import FlowerReading from './components/FlowerReading.jsx'
import PetalRain from './components/PetalRain.jsx'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [selectedFlower, setSelectedFlower] = useState(null)
  const gardenScene = useRef(null)
  const activeFlower = flowers.find(flower => flower.id === selectedFlower)

  function handleBloom(id) {
    setSelectedFlower(current => current ?? id)
  }

  function handleRead(id) {
    setSelectedFlower(id)
  }

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
          {flowers.map(flower => (
            <PlantingArea key={flower.id} flower={flower} active={flower.id === selectedFlower} onBloom={handleBloom} onRead={handleRead} />
          ))}
        </div>
        <div className="reading-space">
          {activeFlower && <FlowerReading key={activeFlower.id} flower={activeFlower} />}
        </div>
      </section>
      <PetalRain enabled={entered} />
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
