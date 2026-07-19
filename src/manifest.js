import { useEffect, useState } from 'react'
import { CASES } from './data.js'
import { MANIFEST_URL } from './config.js'
import { fetchCasesFromSheets } from './sheets.js'

/**
 * Источники данных (в порядке приоритета):
 *   1. Google Sheets — кейсы (Cases + Media листы), если задан VITE_SHEETS_ID
 *   2. Cloudflare R2  — manifest.json, если задан VITE_R2_BASE; отсюда берётся hero
 *   3. data.js        — встроенный фолбэк, сайт никогда не будет пустым
 *
 * Формат manifest.json (R2) не изменился; hero по-прежнему берётся оттуда.
 * Кейсы из Google Sheets имеют приоритет над кейсами из manifest.json.
 */
export function useManifest() {
  const [state, setState] = useState({
    cases: CASES,
    hero: null,
    source: 'local',
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      // 1. Google Sheets — кейсы
      let sheetsCases = null
      try {
        sheetsCases = await fetchCasesFromSheets()
      } catch (err) {
        console.warn('[manifest] Sheets недоступен, пробую R2:', err.message)
      }

      // 2. R2 manifest — hero-медиа (и кейсы как запасной вариант)
      let r2Cases = null
      let hero = null
      if (MANIFEST_URL) {
        try {
          const r = await fetch(MANIFEST_URL, { cache: 'no-cache' })
          if (r.ok) {
            const m = await r.json()
            r2Cases = Array.isArray(m?.cases) && m.cases.length ? m.cases : null
            hero = m?.hero || null
          }
        } catch (err) {
          console.warn('[manifest] R2 недоступен, использую data.js:', err.message)
        }
      }

      if (cancelled) return

      const cases = sheetsCases || r2Cases || CASES
      const source = sheetsCases ? 'sheets' : (r2Cases ? 'r2' : 'local')
      setState({ cases, hero, source })
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
