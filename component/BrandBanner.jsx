const MINT = 'var(--cb-mint)'

export default function BrandBanner({ subtitle = 'PILOT UTILITY SUITE' }) {
  return (
    <div className="cb-banner" style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '1px 20px',
      flexShrink: 0,
    }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, flexShrink: 0 }}>
        <svg width="64" height="64" viewBox="0 0 512 512" style={{ position: 'absolute', top: 0, left: 0 }}>
          <polyline points="50,334 50,86 86,50 426,50 462,86 462,426 426,462 178,462" fill="none" stroke={MINT} strokeWidth="10" strokeLinejoin="miter" />
          <polyline points="66,330 66,102 102,66 410,66 446,102 446,410 410,446 190,446" fill="none" stroke={MINT} strokeWidth="6" strokeLinejoin="miter" />
        </svg>
        <div className="cb-banner-bigc" style={{
          position: 'relative',
          fontFamily: "'Tourney', sans-serif",
          fontWeight: 900,
          fontSize: 58,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: `2px ${MINT}`,
        }}>C</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
        <svg className="cb-banner-wordmark" width="242" height="30" viewBox="0 0 560 70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cb-banner-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   style={{ stopColor: 'var(--cb-mint)' }} />
              <stop offset="55%"  style={{ stopColor: 'var(--cb-blue)' }} />
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
            stroke="url(#cb-banner-grad)"
            strokeWidth="2"
          >CLAUDEBORNE</text>
        </svg>
        <div style={{ width: '100%', height: 1, background: 'var(--cb-line-2)' }} />
        <div style={{
          fontFamily: "'Chakra Petch', sans-serif",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--cb-blue)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>{subtitle}</div>
      </div>
    </div>
  )
}
