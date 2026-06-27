import { useEffect, useRef } from 'react'

const MINT = 'var(--cb-mint)'

const FADE_IN = 700
const MOVE_DRAW = 1600
const WORD_FADE = 1000
const HOLD = 1000
const OUT = 800
const TOTAL = FADE_IN + MOVE_DRAW + WORD_FADE + HOLD + OUT

export default function SplashScreen({ onFinish }) {
  const cBoxRef = useRef(null)
  const wordmarkRef = useRef(null)
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const overlayRef = useRef(null)
  const timersRef = useRef([])

  const skip = () => {
    timersRef.current.forEach(clearTimeout)
    onFinish?.()
  }

  useEffect(() => {
    const cBox = cBoxRef.current
    const wordmarkBox = wordmarkRef.current
    const outer = outerRef.current
    const inner = innerRef.current
    const overlay = overlayRef.current

    const outerLen = outer.getTotalLength()
    const innerLen = inner.getTotalLength()
    outer.style.strokeDasharray = outerLen
    inner.style.strokeDasharray = innerLen
    outer.style.strokeDashoffset = outerLen
    inner.style.strokeDashoffset = innerLen

    const gap = 10
    const delta = (wordmarkBox.offsetWidth + gap) / 2
    cBox.style.transform = `translateX(${delta}px)`

    const raf = requestAnimationFrame(() => {
      cBox.style.transition = `opacity ${FADE_IN}ms ease-out`
      cBox.style.opacity = '1'
    })

    const t1 = setTimeout(() => {
      cBox.style.transition = `transform ${MOVE_DRAW}ms ease-in-out`
      cBox.style.transform = 'translateX(0)'
      outer.style.transition = `stroke-dashoffset ${MOVE_DRAW}ms linear`
      inner.style.transition = `stroke-dashoffset ${MOVE_DRAW}ms linear`
      outer.style.strokeDashoffset = 0
      inner.style.strokeDashoffset = 0
    }, FADE_IN)

    const t2 = setTimeout(() => {
      wordmarkBox.style.transition = `opacity ${WORD_FADE}ms ease-out`
      wordmarkBox.style.opacity = '1'
    }, FADE_IN + MOVE_DRAW)

    const t3 = setTimeout(() => {
      overlay.style.transition = `opacity ${OUT}ms ease-in`
      overlay.style.opacity = '0'
    }, FADE_IN + MOVE_DRAW + WORD_FADE + HOLD)

    const t4 = setTimeout(() => {
      onFinish?.()
    }, TOTAL)

    timersRef.current = [t1, t2, t3, t4]

    return () => {
      cancelAnimationFrame(raf)
      timersRef.current.forEach(clearTimeout)
    }
  }, [onFinish])

  return (
    <div ref={overlayRef} className="cb-grid-bg" onClick={skip} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        <div ref={cBoxRef} style={{
          position: 'relative',
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: 0,
        }}>
          <svg width="64" height="64" viewBox="0 0 512 512" style={{ position: 'absolute', top: 0, left: 0 }}>
            <polyline ref={outerRef} points="50,334 50,86 86,50 426,50 462,86 462,426 426,462 178,462" fill="none" stroke={MINT} strokeWidth="10" strokeLinejoin="miter" />
            <polyline ref={innerRef} points="66,330 66,102 102,66 410,66 446,102 446,410 410,446 190,446" fill="none" stroke={MINT} strokeWidth="6" strokeLinejoin="miter" />
          </svg>
          <div style={{
            position: 'relative',
            fontFamily: "'Tourney', sans-serif",
            fontWeight: 900,
            fontSize: 58,
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: `2px ${MINT}`,
          }}>C</div>
        </div>

        <div ref={wordmarkRef} style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', opacity: 0 }}>
          <svg width="242" height="30" viewBox="0 0 560 70" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cb-splash-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'var(--cb-mint)' }} />
                <stop offset="55%" style={{ stopColor: 'var(--cb-blue)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--cb-violet)' }} />
              </linearGradient>
            </defs>
            <text
              x="280" y="52"
              textAnchor="middle"
              fontFamily="Tourney, sans-serif"
              fontWeight="400"
              fontSize="58"
              fill="none"
              stroke="url(#cb-splash-grad)"
              strokeWidth="2"
            >CLAUDEBORNE</text>
          </svg>
          <div style={{ width: '100%', height: 1, background: 'var(--cb-line-2)' }} />
        </div>

      </div>
    </div>
  )
}
