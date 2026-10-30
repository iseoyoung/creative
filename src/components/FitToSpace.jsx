import { useLayoutEffect, useRef, useState } from 'react'

// Fit the full passage, including an expanded sentence, to the available height.
// Measuring the unscaled content avoids resize loops and text truncation.
export default function FitToSpace({ children }) {
  const viewport = useRef(null)
  const content = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    function fit() {
      const available = viewport.current?.clientHeight ?? 0
      const natural = content.current?.offsetHeight ?? 0
      setScale(available && natural ? Math.min(1, available / natural) : 1)
    }
    const observer = new ResizeObserver(fit)
    observer.observe(viewport.current)
    observer.observe(content.current)
    fit()
    return () => observer.disconnect()
  }, [])

  return (
    <div className="reading-fit" ref={viewport}>
      <div className="reading-fit__content" ref={content} style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
