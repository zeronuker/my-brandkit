import { useState } from 'react'

/**
 * Renders a `CHANGELOG` array (see changelog-template/changelog.js.template)
 * as the standard ClaudeBorne changelog: the current version always shown
 * expanded with a "you are here" marker, every past version collapsed
 * behind one "Show previous versions" toggle.
 *
 * Pure presentational, self-contained — no CSS classes required from the
 * consuming app. Theming goes through the same --cb-* tokens every app
 * already gets from brand.css, plus --cb-update-accent (defaults to
 * --cb-mint) so the current-entry highlight matches whatever accent color
 * the app's UpdatePrompt uses, including a runtime-customizable theme.
 *
 * Each entry: { v, date, title, notes, current? }. `notes` are strings
 * optionally prefixed "NEW:", "IMP:", "FIX:", or "DEP:" — the prefix is
 * pulled off and rendered as a colored badge; a note with no recognized
 * prefix renders as plain text.
 *
 * Usage: <Changelog changelog={CHANGELOG} />
 */
export default function Changelog({ changelog }) {
  const [showHistory, setShowHistory] = useState(false)
  const current = changelog.find((e) => e.current) ?? changelog[changelog.length - 1]
  const past = changelog.filter((e) => e !== current).slice().reverse()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, textAlign: 'left' }}>
      <ChangelogEntry entry={current} isCurrent />

      {past.length > 0 && (
        <button
          onClick={() => setShowHistory((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '10px 0',
            background: 'transparent', border: 'none', borderBottom: '1px dashed var(--cb-line-2)',
            color: 'var(--cb-ink-dim)', fontFamily: 'var(--cb-font-mono)',
            fontSize: 11, letterSpacing: '0.1em',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span>{showHistory ? '▲' : '▼'}</span>
          <span>{showHistory ? 'Hide' : 'Show'} previous versions ({past.length})</span>
        </button>
      )}

      {showHistory && past.map((entry) => <ChangelogEntry key={entry.v} entry={entry} />)}
    </div>
  )
}

function ChangelogEntry({ entry, isCurrent = false }) {
  return (
    <article style={{
      padding: 18,
      borderBottom: '1px solid var(--cb-line)',
      ...(isCurrent ? {
        background: 'color-mix(in srgb, var(--cb-update-accent) 6%, transparent)',
        margin: '0 -18px',
      } : {}),
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--cb-font-display)', fontWeight: 700, fontSize: 20,
          backgroundImage: 'var(--cb-grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent', letterSpacing: '0.04em',
        }}>
          {entry.v}
        </span>
        <span style={{
          fontFamily: 'var(--cb-font-mono)', fontSize: 10, letterSpacing: '0.18em',
          color: 'var(--cb-ink-dim)', textTransform: 'uppercase',
        }}>
          {entry.date}
        </span>
        {isCurrent && (
          <span style={{
            fontFamily: 'var(--cb-font-mono)', fontSize: 10, letterSpacing: '0.18em',
            color: 'var(--cb-update-accent)', textTransform: 'uppercase', marginLeft: 'auto',
          }}>
            // you are here
          </span>
        )}
      </div>
      <h4 style={{
        fontFamily: 'var(--cb-font-display)', fontWeight: 500, fontSize: 15,
        margin: '0 0 10px', color: 'var(--cb-ink-2)', letterSpacing: '0.02em',
      }}>
        {entry.title}
      </h4>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {entry.notes.map((note, i) => (
          <li key={i} style={{ fontSize: 12.5, color: 'var(--cb-ink-2)', lineHeight: 1.6, padding: '3px 0' }}>
            <ChangelogNote note={note} />
          </li>
        ))}
      </ul>
    </article>
  )
}

const TAG_COLORS = {
  NEW: { color: '#4fc77a', border: '#1b6b2f', bg: 'rgba(79,199,122,0.1)' },
  IMP: { color: '#4fc3f7', border: '#1e5a7a', bg: 'rgba(79,195,247,0.1)' },
  FIX: { color: '#f5c542', border: '#b8860b', bg: 'rgba(245,197,66,0.1)' },
  DEP: { color: '#ff6b6b', border: '#a33',    bg: 'rgba(239,68,68,0.1)' },
}

function ChangelogNote({ note }) {
  const m = /^(NEW|IMP|FIX|DEP):\s*/.exec(note)
  if (!m) return note
  const t = TAG_COLORS[m[1]]
  return (
    <>
      <span style={{
        display: 'inline-block', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em',
        padding: '0 5px', marginRight: 6, border: `1px solid ${t.border}`, borderRadius: 3,
        lineHeight: 1.5, verticalAlign: 1, color: t.color, background: t.bg,
      }}>
        {m[1]}
      </span>
      {note.slice(m[0].length)}
    </>
  )
}

/**
 * The app's displayed version, derived from the changelog so it can never
 * drift out of sync with it — pass the same `CHANGELOG` array given to
 * <Changelog />.
 */
export function currentVersion(changelog) {
  return (changelog.find((e) => e.current) ?? changelog[changelog.length - 1]).v
}
