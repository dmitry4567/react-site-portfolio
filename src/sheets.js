import { sheetsUrl } from './config.js'

// Парсит JSONP-обёртку Google Visualization Query API.
// Ответ выглядит так: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
function parseGvizResponse(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\((\{[\s\S]*\})\)/)
  if (!match) throw new Error('Неожиданный формат ответа gviz')
  const data = JSON.parse(match[1])
  if (data.status !== 'ok') {
    const msg = data.errors?.[0]?.message || 'неизвестная ошибка'
    throw new Error(`Ошибка Google Sheets: ${msg}`)
  }
  return data.table
}

// Превращает таблицу gviz в массив объектов, используя первую строку как заголовки.
// filterKey — имя колонки, по которой фильтруются пустые строки.
function tableToRows(table, filterKey = 'id') {
  const headers = table.cols.map(c => (c.label || c.id).trim())
  return table.rows
    .map(row => {
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = row.c?.[i]?.v ?? ''
      })
      return obj
    })
    .filter(row => row[filterKey])
}

async function fetchSheet(sheetName, filterKey = 'id') {
  const url = sheetsUrl(sheetName)
  if (!url) return null
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const table = parseGvizResponse(await res.text())
  return tableToRows(table, filterKey)
}

/**
 * Загружает кейсы из Google Sheets.
 *
 * Ожидаемая структура листа «Cases» (первая строка — заголовки):
 *   id | year | title_ru | title_en | role_ru | role_en | goal_ru | goal_en |
 *   desc_ru | desc_en | result_ru | result_en | tags_ru | tags_en
 *
 * tags_ru / tags_en — теги через точку с запятой, например: Брендинг;Айдентика
 *
 * Ожидаемая структура листа «Media» (необязателен):
 *   case_id | key | type | src | poster
 *
 *   key    — слот медиа: m0, m1, m2, ...
 *   type   — image или video
 *   src    — путь относительно R2 или полный URL
 *   poster — только для video, путь к обложке (необязательно)
 *
 * Возвращает массив кейсов в формате manifest.json или null, если SHEETS_ID не задан.
 */
export async function fetchCasesFromSheets() {
  const [casesRows, mediaRows] = await Promise.all([
    fetchSheet('Cases', 'id'),
    fetchSheet('Media', 'case_id').catch(() => null), // лист Media необязателен
  ])

  if (!casesRows) return null

  // Строим карту медиа: { case_id → { key → { type, src, poster? } } }
  const mediaMap = {}
  if (mediaRows) {
    for (const row of mediaRows) {
      if (!row.case_id || !row.key) continue
      if (!mediaMap[row.case_id]) mediaMap[row.case_id] = {}
      const entry = { type: String(row.type || 'image'), src: String(row.src || '') }
      if (row.poster) entry.poster = String(row.poster)
      mediaMap[row.case_id][row.key] = entry
    }
  }

  return casesRows.map(row => {
    const c = {
      id:     String(row.id),
      year:   String(row.year || ''),
      title:  { ru: String(row.title_ru  || ''), en: String(row.title_en  || '') },
      role:   { ru: String(row.role_ru   || ''), en: String(row.role_en   || '') },
      goal:   { ru: String(row.goal_ru   || ''), en: String(row.goal_en   || '') },
      desc:   { ru: String(row.desc_ru   || ''), en: String(row.desc_en   || '') },
      result: { ru: String(row.result_ru || ''), en: String(row.result_en || '') },
      tags: {
        ru: String(row.tags_ru || '').split(';').map(t => t.trim()).filter(Boolean),
        en: String(row.tags_en || '').split(';').map(t => t.trim()).filter(Boolean),
      },
    }
    if (mediaMap[c.id]) c.media = mediaMap[c.id]
    return c
  })
}
