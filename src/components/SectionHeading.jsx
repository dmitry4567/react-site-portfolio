/** Заголовок секции: mono-индекс + крупный display-заголовок, hairline сверху. */
export default function SectionHeading({ index = '01', label = 'WORK', title, count }) {
  return (
    <header style={{ borderTop: '1px solid var(--line-1)', paddingTop: 'var(--space-5)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)',
        letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase',
        color: 'var(--fg-3)', marginBottom: 'var(--space-6)',
      }}>
        <span>{index} / {label}</span>
        {count ? <span>{count}</span> : null}
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-display)',
        fontSize: 'var(--text-h2)', lineHeight: 'var(--leading-display)',
        letterSpacing: 'var(--tracking-display)', color: 'var(--fg-1)',
        margin: 0, textTransform: 'uppercase',
      }}>{title}</h2>
    </header>
  )
}
