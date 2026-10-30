import { titleLettering } from '../data/titleLettering.js'

export default function DrawnTitle() {
  return (
    <h1 id="title-heading" className="drawn-title">
      <span className="sr-only">MRS.DALLOWAY</span>
      <svg viewBox={`-40 -40 ${titleLettering.width + 80} 960`} aria-hidden="true" focusable="false">
        <g transform="translate(0 780) scale(1 -1)">
          {titleLettering.letters.map((letter, index) => (
            <path key={index} className="drawn-title__letter" d={letter.path} transform={`translate(${letter.x} 0)`} pathLength="1" style={{ '--letter-delay': `${index * .16}s` }} />
          ))}
        </g>
      </svg>
    </h1>
  )
}
