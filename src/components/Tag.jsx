import { useState } from 'react'

/** Mono-пилюля для навыков/дисциплин. active = лаймовая заливка. */
export default function Tag({ children, active = false, onClick }) {
  const [hover, setHover] = useState(false)
  const style = {
    display: 'inline-flex', alignItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)',
    letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase',
    padding: '8px 16px', borderRadius: 'var(--radius-pill)',
    border: `1px solid ${active ? 'var(--accent)' : hover ? 'var(--line-2)' : 'var(--line-1)'}`,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? 'var(--accent-ink)' : hover ? 'var(--fg-1)' : 'var(--fg-2)',
    cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap',
    transition: 'all var(--dur-fast) var(--ease-swift)',
  }
  return (
    <span style={style} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </span>
  )
}
