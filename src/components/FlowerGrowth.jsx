import { useId } from 'react'
import { growth, GROWTH_DURATION, GROWTH_SPEED } from '../data/growth.js'
import { organPaths } from '../data/organPaths.js'

export default function FlowerGrowth({ flower }) {
  const id = useId()
  const frame = flower.frames[4]
  const anatomy = growth[flower.id]
  const outlines = organPaths[flower.id]
  const blooms = outlines.bloomParts
  const hub = flower.id === 'lilac' ? [1310, 620] : flower.id === 'roses' ? [1270, 650] : [1260, 600]
  const root = flower.id === 'lilac' ? [1270, 954] : [1195, 954]
  const stems = [{ path: `M${root[0]} ${root[1]} C${root[0] + 35} 850 ${hub[0] - 15} 730 ${hub[0]} ${hub[1]}`, delay: 0, duration: 4.5 }, ...blooms.map(part => ({
    path: `M${hub[0]} ${hub[1]} Q${part.origin[0]} ${hub[1] - 50} ${part.origin[0]} ${part.origin[1]}`,
    delay: 3.8,
    duration: 3.8,
  }))]
  const [budX, budY, budWidth, budHeight] = anatomy.budSource
  const image = <image href={flower.sheet} width="1536" height="1024" />
  const partStyle = (part, duration) => ({
    '--delay': `${part.delay / GROWTH_SPEED}s`,
    '--duration': `${duration / GROWTH_SPEED}s`,
    '--unfold': `${part.rotate ?? 0}deg`,
    transformOrigin: `${part.origin[0]}px ${part.origin[1]}px`,
  })

  return (
    <svg className="flower-frame flower-growth" viewBox={`${frame.x} 0 ${frame.width} 1024`} aria-hidden="true" style={{ '--growth-duration': `${GROWTH_DURATION}ms` }}>
      <defs>
        <clipPath id={`${id}-silhouette`}><polygon points={frame.points} /></clipPath>
        <clipPath id={`${id}-bud-source`}><polygon points={flower.frames[anatomy.budFrame ?? 2].points} /></clipPath>
        <clipPath id={`${id}-bud-head`}><ellipse cx={budX + budWidth / 2} cy={budY + budHeight * .44} rx={budWidth * .46} ry={budHeight * .44} /></clipPath>
        <linearGradient id={`${id}-stem-color`}><stop stopColor="#a6a36f" /><stop offset=".5" stopColor="#6e8254" /><stop offset="1" stopColor="#b7a077" /></linearGradient>
        <filter id={`${id}-stem-texture`} x="-20%" y="-5%" width="140%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="7" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {outlines.leaves.map((path, index) => <clipPath key={`leaf-${index}`} id={`${id}-leaf-${index}`}><path d={path} clipRule="evenodd" /></clipPath>)}
        {outlines.blooms.map((path, index) => <clipPath key={`bloom-${index}`} id={`${id}-bloom-${index}`}><path d={path} clipRule="evenodd" /></clipPath>)}
      </defs>
      <g className="growing-skeleton" fill="none" strokeLinecap="round" filter={`url(#${id}-stem-texture)`}>
        {stems.map((stem, index) => (
          <g key={index}>
            <path className="growing-stem" d={stem.path} pathLength="1" stroke="#b5a579" strokeWidth={index === 0 ? 17 : 9} opacity=".5" style={{ '--delay': `${stem.delay / GROWTH_SPEED}s`, '--duration': `${stem.duration / GROWTH_SPEED}s` }} />
            <path className="growing-stem" d={stem.path} pathLength="1" stroke={`url(#${id}-stem-color)`} strokeWidth={index === 0 ? 10 : 5} style={{ '--delay': `${stem.delay / GROWTH_SPEED}s`, '--duration': `${stem.duration / GROWTH_SPEED}s` }} />
          </g>
        ))}
      </g>
        {anatomy.leaves.map((part, index) => (
          <g className="growing-leaf" key={`leaf-${index}`} style={partStyle(part, 3.5)}>
            <g clipPath={`url(#${id}-silhouette)`}><g clipPath={`url(#${id}-leaf-${index})`}>{image}</g></g>
          </g>
        ))}
      {blooms.map((part, index) => {
        const [, , width, height] = part.bud
        return (
          <g key={`bud-${index}`} className="growing-bud" style={{ '--delay': `${(part.delay - 3) / GROWTH_SPEED}s`, '--duration': `${5 / GROWTH_SPEED}s`, transformOrigin: `${part.origin[0]}px ${part.origin[1]}px` }}>
            <svg x={part.origin[0] - width / 2} y={part.origin[1] - height} width={width} height={height} viewBox={`${budX} ${budY} ${budWidth} ${budHeight}`}>
              <g clipPath={`url(#${id}-bud-source)`}><g clipPath={`url(#${id}-bud-head)`}>{image}</g></g>
            </svg>
          </g>
        )
      })}
      {blooms.map((part, index) => (
        <g className="growing-bloom" key={`bloom-${index}`} style={partStyle(part, 4.5)}>
          <g clipPath={`url(#${id}-silhouette)`}><g clipPath={`url(#${id}-bloom-${index})`}>{image}</g></g>
        </g>
      ))}
      <g className="grown-plant" clipPath={`url(#${id}-silhouette)`}>{image}</g>
    </svg>
  )
}
