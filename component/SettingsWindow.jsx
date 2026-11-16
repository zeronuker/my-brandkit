import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ChamferFrame from './ChamferFrame.jsx'

// The standard Settings window for every ClaudeBorne app: tabs down the left, the chosen tab's settings on the
// right. A centred ChamferFrame window on desktop and iPad; full screen with a slim icon column on a phone
// (max-width 640px, or max-height 500px for a phone held sideways). Styles: .cbs-* in static/css/brand.css.
//
// The app owns the state: `tabs` ([{ id, label, hint, icon }]), `active` + `onTab`, and the settings themselves
// (rendered as `children` for the active tab, built from SettingsSection / SettingsRow / Seg / Switch / Reveal).
// `closing` plays the exit animation; the app unmounts the window when it is done (after anim.ms).
// `anim` follows the app's own Animation setting: { style: 'slide' | 'rise' | 'cascade', ms } (ms 0 = off).
// `footer` replaces the right side of the footer (default "Changes save as you go").

const ICONS = {
  general: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  palette: '<circle cx="12" cy="12" r="8.5"/><circle cx="8.3" cy="10" r="1.1"/><circle cx="12" cy="7.6" r="1.1"/><circle cx="15.7" cy="10" r="1.1"/><path d="M12 20.5c-1.6 0-2.1-1.6-1.1-2.6.9-.9.4-2.9 2-2.9h3.4"/>',
  views: '<rect x="3.5" y="5" width="17" height="14"/><path d="M9.5 5v14M15 5v14"/>',
  nav: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3l8.7-8.7z"/><path d="M14.7 6.3L17 4"/>',
  about: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5"/>',
  logbook: '<path d="M9 7h11M9 12h11M9 17h11M4.5 7h.5M4.5 12h.5M4.5 17h.5"/>',
}

export function TabIcon({ name }) {
  return <svg className="cbs-icon" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.general }} />
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function SettingsWindow({ appName, version, tabs, active, onTab, onClose, closing = false, anim = {}, footer, zIndex = 2000, children }) {
  const frameRef = useRef(null)
  const railRef = useRef(null)
  const paneRef = useRef(null)
  const indRef = useRef(null)
  const firstPlace = useRef(true) // the first placement must not glide
  const ms = anim.ms ?? 260
  const style = ['slide', 'rise', 'cascade'].includes(anim.style) ? anim.style : 'slide'
  const index = id => tabs.findIndex(t => t.id === id)
  const tab = tabs[Math.max(0, index(active))]

  // which way the page moves: down the list of tabs slides up, back up the list slides down
  const prev = useRef(active)
  const dir = useRef(1)
  if (prev.current !== active) {
    dir.current = index(active) >= index(prev.current) ? 1 : -1
    prev.current = active
  }
  const [playing, setPlaying] = useState(false)
  const first = useRef(true)
  useLayoutEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0
    if (first.current) { first.current = false; return undefined }
    if (!ms) return undefined
    // cascade: each heading and setting comes in a moment after the one above it
    paneRef.current?.querySelectorAll('.cbs-pane-title, .cbs-pane-hint, .cbs-sec-h, .cbs-row').forEach((el, i) => el.style.setProperty('--i', i))
    setPlaying(true)
    const t = setTimeout(() => setPlaying(false), ms * 3 + 400)
    return () => clearTimeout(t)
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  // the highlight glides to the chosen tab; placed without a glide on open and when the window changes size
  useLayoutEffect(() => {
    const place = glide => {
      const ind = indRef.current
      const on = railRef.current?.querySelector('[aria-selected="true"]')
      if (!ind || !on) return
      if (!glide) ind.style.transition = 'none'
      ind.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`
      ind.style.width = on.offsetWidth + 'px'
      ind.style.height = on.offsetHeight + 'px'
      if (!glide) { void ind.offsetWidth; ind.style.transition = '' }
    }
    place(!firstPlace.current)
    firstPlace.current = false
    const ro = new ResizeObserver(() => place(false))
    if (railRef.current) ro.observe(railRef.current)
    return () => ro.disconnect()
  }, [active])

  // focus the window on open, give focus back on close
  useEffect(() => {
    const before = document.activeElement
    frameRef.current?.focus({ preventScroll: true }) // the window itself, so no focus ring shows until the keyboard is used
    return () => before?.focus?.()
  }, [])

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); return }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.closest?.('.cbs-rail')) {
      e.preventDefault()
      const i = (index(active) + (e.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length
      onTab(tabs[i].id)
      requestAnimationFrame(() => railRef.current?.querySelector('[aria-selected="true"]')?.focus())
      return
    }
    if (e.key !== 'Tab') return
    const els = [...frameRef.current.querySelectorAll(FOCUSABLE)].filter(el => !el.closest('[inert]'))
    if (!els.length) return
    const firstEl = els[0], last = els[els.length - 1]
    if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); firstEl.focus() }
  }

  const label = version ? `${appName} · ${version}` : appName
  return (
    <>
      <div className={'cbs-scrim' + (closing ? ' is-closing' : '')} style={{ zIndex, '--cbs-dur': `${ms}ms` }} onClick={onClose} />
      <ChamferFrame ref={frameRef} role="dialog" aria-modal="true" aria-label="Settings" tabIndex={-1} onKeyDown={onKeyDown}
        className={'cbs' + (closing ? ' is-closing' : '')} style={{ zIndex: zIndex + 1, '--cbs-dur': `${ms}ms` }}>
        <header className="cbs-head">
          <div className="cbs-title"><h2>Settings</h2><div>{label}</div></div>
          <button type="button" className="cbs-x" onClick={onClose} aria-label="Close settings">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="cbs-body">
          <nav className="cbs-rail" role="tablist" aria-label="Settings" aria-orientation="vertical" ref={railRef}>
            <i className="cbs-ind" ref={indRef} aria-hidden="true" />
            {tabs.map(t => (
              <button key={t.id} type="button" role="tab" id={`cbs-tab-${t.id}`} aria-selected={t.id === tab.id}
                aria-controls="cbs-panel" tabIndex={t.id === tab.id ? 0 : -1} className="cbs-tab" onClick={() => onTab(t.id)}>
                <TabIcon name={t.icon} />
                <span className="cbs-tl">{t.label}</span>
                {t.hint && <span className="cbs-th">{t.hint}</span>}
              </button>
            ))}
          </nav>
          <div className="cbs-pane" ref={paneRef} role="tabpanel" id="cbs-panel" aria-labelledby={`cbs-tab-${tab.id}`}>
            <div key={tab.id} className={'cbs-pane-in' + (playing ? ' cbs-anim-' + style : '')} style={{ '--dir': dir.current }}>
              <h3 className="cbs-pane-title">{tab.label}</h3>
              {tab.hint && <div className="cbs-pane-hint">{tab.hint}</div>}
              {children}
            </div>
          </div>
        </div>
        <footer className="cbs-foot">
          <span>{label}</span>
          {footer ?? <span>Changes save as you go</span>}
        </footer>
      </ChamferFrame>
    </>
  )
}

// A titled group of settings.
export function SettingsSection({ title, children }) {
  return (
    <section className="cbs-sec">
      {title && <div className="cbs-sec-h"><span>{title}</span><i /></div>}
      {children}
    </section>
  )
}

// One setting: its name and a line saying what it does on the left, the control on the right.
// `wide`: the control drops under the name when the pane is narrow (choice rows, lists, text boxes).
// `full`: the control always sits under the name (tables, the changelog, a row of buttons).
export function SettingsRow({ label, hint, wide, full, children }) {
  return (
    <div className={'cbs-row' + (full ? ' full' : wide ? ' wide' : '')}>
      {(label || hint) && (
        <div className="cbs-row-l">
          {label && <div className="cbs-lab">{label}</div>}
          {hint && <div className="cbs-hint">{hint}</div>}
        </div>
      )}
      <div className="cbs-row-c">{children}</div>
    </div>
  )
}

// A small paragraph under a group of settings.
export function SettingsNote({ children }) {
  return <p className="cbs-note">{children}</p>
}

// Choice buttons: options [{ value, label }].
export function Seg({ options, value, onChange, label }) {
  return (
    <div className="cbs-seg" role="group" aria-label={label}>
      {options.map(o => (
        <button key={String(o.value)} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

// An on/off switch.
export function Switch({ on, onChange, label, disabled }) {
  return (
    <button type="button" className="cbs-sw" role="switch" aria-checked={!!on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}>
      <span />
    </button>
  )
}

// Settings that only matter while another one is on: they fold away and back instead of popping.
export function Reveal({ open, children }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.inert = !open }, [open])
  return <div ref={ref} className={'cbs-dep' + (open ? ' open' : '')} aria-hidden={!open}><div className="cbs-dep-in">{children}</div></div>
}
