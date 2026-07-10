/** Бегущая лаймовая строка между секциями. Элементы соединяются через ✦. */
export default function Marquee({ items = ['ДИЗАЙН', 'ИЛЛЮСТРАЦИЯ', 'МОУШН', 'OPEN TO WORK'], accent = true, size = 22 }) {
  const run = items.map((s) => s.toUpperCase()).join(' ✦ ') + ' ✦ '
  return (
    <div style={{ borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '14px 0' }}>
      <style>{`
        @keyframes ds-marquee-tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .ds-marquee-run { animation: none !important; } }
      `}</style>
      <div
        className="ds-marquee-run"
        style={{
          display: 'inline-block',
          animation: 'ds-marquee-tick var(--dur-marquee) linear infinite',
          fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-display)',
          fontSize: size, letterSpacing: 'var(--tracking-display)',
          color: accent ? 'var(--accent)' : 'var(--fg-3)',
        }}
      >
        <span style={{ paddingRight: 24 }}>{run}</span>
        <span style={{ paddingRight: 24 }}>{run}</span>
      </div>
    </div>
  )
}
