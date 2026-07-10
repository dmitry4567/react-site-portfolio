import { useState } from 'react'

/** Крупная строка-контакт: label слева, огромная display-ссылка с ↗, лаймовая на ховере. */
export default function ContactLink({ label = 'EMAIL', value = 'HI@MARKUS.ONLINE', href = 'mailto:hi@markus.online', size = 44 }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        gap: 'var(--space-6)', padding: 'var(--space-5) 0',
        borderBottom: '1px solid var(--line-1)', textDecoration: 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)',
        letterSpacing: 'var(--tracking-meta)', color: 'var(--fg-3)',
        textTransform: 'uppercase', flex: 'none',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-display)',
        fontSize: size, letterSpacing: 'var(--tracking-display)', lineHeight: 1.1,
        textTransform: 'uppercase', textAlign: 'right',
        color: hover ? 'var(--accent)' : 'var(--fg-1)',
        transition: 'color var(--dur-fast) var(--ease-swift)', overflowWrap: 'anywhere',
      }}>
        {value}
        <span style={{
          display: 'inline-block', marginLeft: 12, fontFamily: 'var(--font-body)', fontWeight: 700,
          transform: hover ? 'translate(6px, -6px)' : 'none',
          transition: 'transform var(--dur-fast) var(--ease-expo)',
        }}>↗</span>
      </span>
    </a>
  )
}
