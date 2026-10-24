import { useEffect, useRef, useState } from 'react'

const COUNTDOWN_SECONDS = 15

// Double-line chamfered frame, drawn with four nested clipped layers (line, face, line, face).
// Self-contained so the toast needs nothing from the host app. Each cut shrinks by 0.586 x its inset
// so the two lines stay parallel.
const CHAMFER = 10
const clip = (inset) => {
  const l = `${(CHAMFER - 0.586 * inset).toFixed(2)}px`
  return `polygon(${l} 0, calc(100% - ${l}) 0, 100% ${l}, 100% calc(100% - ${l}), calc(100% - ${l}) 100%, ${l} 100%, 0 calc(100% - ${l}), 0 ${l})`
}
const LINE = 'var(--cb-update-accent)'
const FACE = 'var(--cb-update-bg)'

/**
 * Bottom-right toast shown when a new service worker is waiting. Never
 * blocks the page — user keeps working underneath it. A 15s countdown
 * (number + depleting bar) auto-triggers the update if left untouched;
 * "Later" cancels the countdown and dismisses instead.
 *
 * `isBusy` (optional) is checked only at the moment the countdown expires —
 * it defers the *automatic* fire (not a manual "Update now" click) for apps
 * that track an in-progress save, so the reload doesn't land mid-write.
 * Apps with no such state just don't pass it.
 *
 * Pure presentational component driven entirely by the `update` prop
 * (the object returned by the `useUpdate` hook) — pair the two together.
 * Theming goes through the --cb-update-* CSS var contract (see brand.css)
 * so it matches each app's own accent color, including runtime-customizable
 * themes, without needing per-app props for colors.
 */
export default function UpdatePrompt({ ready, update, isBusy = false }) {
  const { latest, promptVisible, updateServiceWorker, dismissLatest } = update
  const visible = promptVisible && ready

  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS)
  const [firing, setFiring] = useState(false)
  const isBusyRef = useRef(isBusy)
  const firedRef = useRef(false)

  useEffect(() => {
    isBusyRef.current = isBusy
  }, [isBusy])

  useEffect(() => {
    if (!visible) return
    setRemaining(COUNTDOWN_SECONDS)
    setFiring(false)
    firedRef.current = false

    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // Expired: fire now, or keep polling every second until the app
          // says it's no longer busy.
          if (!isBusyRef.current && !firedRef.current) {
            firedRef.current = true
            setFiring(true)
            updateServiceWorker(true)
          }
          return 0
        }
        return r - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [visible, updateServiceWorker])

  if (!visible) return null

  const onUpdateNow = () => {
    firedRef.current = true
    setFiring(true)
    updateServiceWorker(true)
  }

  const pct = (remaining / COUNTDOWN_SECONDS) * 100

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      width: 'min(310px, calc(100vw - 40px))',
      filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.45))',
    }}>
    <div style={{ background: LINE, clipPath: clip(0), padding: 1.5 }}>
    <div style={{ background: FACE, clipPath: clip(1.5), padding: 3 }}>
    <div style={{ background: LINE, clipPath: clip(4.5), padding: 1.5 }}>
    <div style={{ background: FACE, clipPath: clip(6), padding: '12px 14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: 'var(--cb-update-accent)',
            boxShadow: '0 0 0 3px color-mix(in srgb, var(--cb-update-accent) 20%, transparent)',
          }} />
          <span style={{
            fontFamily: 'var(--cb-font-mono)', fontSize: 10, letterSpacing: '0.14em',
            color: 'var(--cb-update-accent)', textTransform: 'uppercase',
          }}>
            Update available
          </span>
        </div>
        {!firing && (
          <span style={{
            fontFamily: 'var(--cb-font-mono)', fontSize: 10, color: 'var(--cb-update-dim)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {remaining}s
          </span>
        )}
      </div>

      <p style={{
        fontFamily: 'var(--cb-font-body)', fontSize: 12.5, color: 'var(--cb-update-muted)',
        lineHeight: 1.5, margin: '0 0 10px',
      }}>
        {latest
          ? <>Build <span style={{ fontFamily: 'var(--cb-font-mono)', color: 'var(--cb-update-accent)' }}>{latest.version}</span> is ready. Your work stays untouched — updates apply on next reload.</>
          : 'A new build is ready. Your work stays untouched — updates apply on next reload.'}
      </p>

      {!firing && (
        <div style={{ height: 3, borderRadius: 2, background: 'var(--cb-update-border)', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'var(--cb-update-accent)',
            transition: 'width 1s linear',
          }} />
        </div>
      )}

      {firing ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--cb-font-mono)', fontSize: 10, letterSpacing: '0.1em',
          color: 'var(--cb-update-accent)', textTransform: 'uppercase', padding: '4px 0 2px',
        }}>
          <span style={{
            width: 11, height: 11, borderRadius: '50%',
            border: '2px solid color-mix(in srgb, var(--cb-update-accent) 30%, transparent)',
            borderTopColor: 'var(--cb-update-accent)',
            animation: 'cb-update-spin 700ms linear infinite',
          }} />
          Updating…
          <style>{'@keyframes cb-update-spin { to { transform: rotate(360deg); } }'}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onUpdateNow}
            style={{
              flex: 1, background: 'var(--cb-update-accent)', border: 'none', borderRadius: 6,
              color: 'var(--cb-update-bg)', fontFamily: 'var(--cb-font-mono)', fontSize: 10,
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '9px 0', cursor: 'pointer',
            }}
          >
            Update now
          </button>
          <button
            onClick={dismissLatest}
            style={{
              background: 'none', border: 'none', color: 'var(--cb-update-dim)',
              fontFamily: 'var(--cb-font-mono)', fontSize: 10, letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: 'pointer', padding: '9px 10px',
            }}
          >
            Later
          </button>
        </div>
      )}
    </div>
    </div>
    </div>
    </div>
    </div>
  )
}
