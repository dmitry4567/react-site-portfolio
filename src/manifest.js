import { useEffect, useState } from 'react'
import { CASES } from './data.js'
import { MANIFEST_URL } from './config.js'

/**
 * Грузит manifest.json с Cloudflare R2 и отдаёт список кейсов + hero-медиа.
 *
 * Формат манифеста (см. manifest.example.json):
 *   {
 *     "hero": { "photo": { "type": "image", "src": "hero.jpg" } },
 *     "cases": [
 *       {
 *         "id": "arkhipova", "year": "2019—2023",
 *         "title":  { "ru": "...", "en": "..." },
 *         "role":   { "ru": "...", "en": "..." },
 *         "goal":   { "ru": "...", "en": "..." },
 *         "desc":   { "ru": "...", "en": "..." },
 *         "result": { "ru": "...", "en": "..." },
 *         "tags":   { "ru": ["..."], "en": ["..."] },
 *         "media": {
 *           "m0": { "type": "video", "src": "cases/arkhipova/cover.mp4", "poster": "cases/arkhipova/cover.jpg" },
 *           "m1": { "type": "image", "src": "cases/arkhipova/1.jpg" },
 *           "m2": { "type": "image", "src": "cases/arkhipova/2.jpg" },
 *           "m3": { "type": "image", "src": "cases/arkhipova/3.jpg" }
 *         }
 *       }
 *     ]
 *   }
 *
 * Пока манифест грузится (или если R2 недоступен) — показываются встроенные
 * тексты из data.js без медиа, чтобы сайт никогда не был пустым.
 */
export function useManifest() {
  const [state, setState] = useState({
    cases: CASES,   // фолбэк: встроенные тексты
    hero: null,
    source: 'local',
  })

  useEffect(() => {
    if (!MANIFEST_URL) return // базовый URL R2 не задан — остаёмся на фолбэке
    let cancelled = false

    fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((m) => {
        if (cancelled) return
        const cases = Array.isArray(m && m.cases) && m.cases.length ? m.cases : CASES
        setState({ cases, hero: (m && m.hero) || null, source: 'r2' })
      })
      .catch((err) => {
        if (!cancelled) console.warn('[manifest] не удалось загрузить с R2, использую data.js:', err.message)
      })

    return () => { cancelled = true }
  }, [])

  return state
}
