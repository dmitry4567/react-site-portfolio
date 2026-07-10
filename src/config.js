// Конфиг подключения к Cloudflare R2 (S3-совместимое объектное хранилище).
//
// VITE_R2_BASE — публичный базовый URL бакета: либо r2.dev-поддомен,
// либо кастомный домен, привязанный к бакету. Задаётся в .env (см. .env.example).
// Пример: https://media.example.com  или  https://pub-xxxx.r2.dev
//
// Дефолт нужен, чтобы прод-сборка (напр. на Cloudflare, где .env недоступен)
// работала без явной env-переменной. Это публичный адрес — не секрет.
const DEFAULT_R2_BASE = 'https://pub-90501cd797ab41adb096facfadb3b87b.r2.dev'
export const R2_BASE = String(import.meta.env.VITE_R2_BASE || DEFAULT_R2_BASE).replace(/\/+$/, '')

// Имя файла манифеста внутри бакета. Можно переопределить через VITE_R2_MANIFEST.
const MANIFEST_NAME = String(import.meta.env.VITE_R2_MANIFEST || 'manifest.json')

// Полный URL манифеста (или null, если базовый URL не задан).
export const MANIFEST_URL = R2_BASE ? `${R2_BASE}/${MANIFEST_NAME}` : null

// Превращает относительный путь из манифеста в абсолютный URL на R2.
// Абсолютные ссылки (http/https, data:) возвращаются как есть.
export function r2url(src) {
  if (!src) return null
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  if (!R2_BASE) return src
  return `${R2_BASE}/${String(src).replace(/^\/+/, '')}`
}
