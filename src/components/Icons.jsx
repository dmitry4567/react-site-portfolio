/**
 * Инлайновые SVG-иконки вместо юникод-символов (↗ ↓ ▶).
 * На iOS/Android эти символы рендерились цветными эмодзи через системный
 * emoji-шрифт — SVG наследует цвет через currentColor и выглядит одинаково везде.
 */

// Стрелка вверх-вправо (замена ↗)
export function ArrowUpRight({ size = '1em', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flex: 'none', ...style }}>
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Стрелка вниз (замена ↓)
export function ArrowDown({ size = '1em', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flex: 'none', ...style }}>
      <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Треугольник Play (замена ▶)
export function PlayIcon({ size = '1em', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
      style={{ display: 'block', ...style }}>
      <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  )
}
