import { useState } from 'react'

/**
 * Centred modal shown when a new service worker is waiting. User picks
 * which build to run: staying on "Current build" dismisses the prompt
 * (with a pointer to Settings for a manual update later); picking
 * "Latest build" updates now.
 *
 * Pure presentational component driven entirely by the `update` prop
 * (the object returned by the `useUpdate` hook) — pair the two together.
 * Theming goes through the --cb-update-* CSS var contract (see brand.css)
 * so it matches each app's own accent color, including runtime-customizable
 * themes, without needing per-app props for colors.
 */
export default function UpdatePrompt({ ready, update, appLabel }) {
  const { current, latest, promptVisible, updateServiceWorker, dismissLatest } = update
  const [selected, setSelected] = useState('latest')

  if (!promptVisible || !ready) return null

  const onConfirm = () => {
    if (selected === 'latest') {
      updateServiceWorker(true)
    } else {
      dismissLatest()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9998,
      }} />

      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: 'min(320px, calc(100vw - 48px))',
        background: 'var(--cb-update-bg)',
        border: '1px solid color-mix(in srgb, var(--cb-update-accent) 30%, transparent)',
        borderRadius: 10,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        padding: '24px 22px 20px',
      }}>

        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>⬆</span>
          <div>
            <div style={{
              fontFamily: 'var(--cb-font-mono)', fontSize: 10,
              letterSpacing: '0.18em', color: 'var(--cb-update-accent)', marginBottom: 2,
            }}>
              UPDATE AVAILABLE
            </div>
            <div style={{
              fontFamily: 'var(--cb-font-mono)', fontSize: 8,
              letterSpacing: '0.12em', color: 'var(--cb-update-dim)',
            }}>
              {appLabel}
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--cb-font-mono)', fontSize: 10,
          letterSpacing: '0.1em', color: 'var(--cb-update-dim)', marginBottom: 8,
        }}>
          SELECT BUILD
        </div>

        {[
          { key: 'current', label: 'Current build', version: current.version },
          { key: 'latest', label: 'Latest build', version: latest?.version ?? '…' },
        ].map(({ key, label, version }) => {
          const isSelected = selected === key
          return (
            <label
              key={key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1px solid ${isSelected ? 'color-mix(in srgb, var(--cb-update-accent) 60%, transparent)' : 'var(--cb-update-border)'}`,
                background: isSelected ? 'color-mix(in srgb, var(--cb-update-accent) 6%, transparent)' : 'transparent',
                borderRadius: 6, padding: '10px 12px', marginBottom: 8, cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="update-build"
                checked={isSelected}
                onChange={() => setSelected(key)}
                style={{ accentColor: 'var(--cb-update-accent)', flexShrink: 0 }}
              />
              <div>
                <div style={{
                  fontSize: 11, fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? 'var(--cb-update-accent)' : 'var(--cb-update-muted)',
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: 'var(--cb-font-mono)', fontSize: 10,
                  color: isSelected ? 'var(--cb-update-accent)' : 'var(--cb-update-dim)',
                }}>
                  {version}
                </div>
              </div>
            </label>
          )
        })}

        {selected === 'current' && (
          <div style={{
            fontFamily: 'var(--cb-font-body)', fontSize: 11, color: 'var(--cb-update-dim)',
            lineHeight: 1.6, marginTop: 8, marginBottom: 16,
            padding: '10px 12px', borderLeft: '2px solid var(--cb-update-border)',
          }}>
            Staying on current build. Update anytime from Settings → App update.
          </div>
        )}

        <button
          onClick={onConfirm}
          style={{
            width: '100%',
            background: 'color-mix(in srgb, var(--cb-update-accent) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--cb-update-accent) 50%, transparent)',
            borderRadius: 6, color: 'var(--cb-update-accent)',
            fontFamily: 'var(--cb-font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', padding: '11px 0', cursor: 'pointer',
            marginTop: selected === 'current' ? 0 : 8,
          }}
        >
          {selected === 'latest' ? 'UPDATE NOW' : 'GOT IT'}
        </button>
      </div>
    </>
  )
}
