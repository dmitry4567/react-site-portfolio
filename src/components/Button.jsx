import { useState } from 'react'

/** Пилюля-кнопка. variant: 'accent' (единственный CTA) | 'outline' | 'ghost' */
export default function Button({ variant = 'outline', size = 'md', children, href, onClick, disabled }) {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)
  const pad = size === 'lg' ? '18px 36px' : size === 'sm' ? '10px 20px' : '14px 28px'

  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-meta)',
    letterSpacing: 'var(--tracking-meta)', textTransform: 'uppercase',
    borderRadius: 'var(--radius-pill)', padding: pad,
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid transparent', textDecoration: 'none',
    transition: 'all var(--dur-fast) var(--ease-swift)',
    transform: press ? 'scale(0.97)' : 'none',
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    background: 'transparent', whiteSpace: 'nowrap',
  }
  const variants = {
    accent: {
      background: hover ? 'var(--accent-hover)' : 'var(--accent)',
      color: 'var(--accent-ink)',
      boxShadow: press ? 'var(--glow-sm)' : hover ? 'var(--glow-lg)' : 'var(--glow-sm)',
    },
    outline: {
      border: `1px solid ${hover ? 'var(--accent)' : 'var(--line-2)'}`,
      background: hover ? 'rgba(var(--accent-rgb), 0.08)' : 'transparent',
      color: hover ? 'var(--accent)' : 'var(--fg-1)',
      boxShadow: hover ? 'var(--glow-md)' : 'none',
    },
    ghost: {
      color: hover ? 'var(--accent)' : 'var(--fg-1)',
      textShadow: hover ? 'var(--glow-text)' : 'none',
    },
  }
  const style = { ...base, ...variants[variant] }
  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      href={href}
      onClick={onClick}
      disabled={href ? undefined : disabled}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false) }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
    >
      {children}
    </Tag>
  )
}
