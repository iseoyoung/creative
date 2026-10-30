import { useId } from 'react'

export default function FlowerFrame({ flower, index }) {
  const clipId = useId()
  const frame = flower.frames[index]

  return (
    <svg className="flower-frame" viewBox={`${frame.x} 0 ${frame.width} 1024`} aria-hidden="true">
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <polygon points={frame.points} />
        </clipPath>
      </defs>
      <image href={flower.sheet} width="1536" height="1024" clipPath={`url(#${clipId})`} />
    </svg>
  )
}
