import { useState } from 'react'
import { r2url } from '../config.js'

/**
 * Показывает фото или видео из R2 по дескриптору из манифеста:
 *   { type: 'image' | 'video', src: 'путь/в/бакете', poster?: 'путь/к/постеру' }
 *
 * Если дескриптор пуст, URL не задан или медиа не загрузилось — показывает
 * плейсхолдер (как прежний ImageSlot, но без ручной загрузки).
 *
 * Видео проигрывается тихо, зациклено и без звука (обложка-видео).
 */
export default function MediaSlot({ media, placeholder = 'Медиа', fit = 'cover' }) {
  const [failed, setFailed] = useState(false)

  const src = media && r2url(media.src)
  const poster = media && media.poster ? r2url(media.poster) : undefined
  const type = media && media.type === 'video' ? 'video' : 'image'
  const show = src && !failed

  const box = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-2)', overflow: 'hidden',
  }
  const mediaStyle = { width: '100%', height: '100%', objectFit: fit }

  if (!show) {
    return (
      <div style={box} title={placeholder}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-meta)',
          textTransform: 'uppercase', color: 'var(--fg-3)', textAlign: 'center', padding: 12,
        }}>{placeholder}</span>
      </div>
    )
  }

  return (
    <div style={box}>
      {type === 'video' ? (
        <video
          src={src}
          poster={poster}
          style={mediaStyle}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={src}
          alt=""
          style={mediaStyle}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
