// Генерирует manifest.example.json из встроенных данных data.js.
// Медиа проставляются по соглашению об именах — пути правьте под свои файлы на R2.
//   node scripts/gen-manifest.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { CASES } from '../src/data.js'

const here = dirname(fileURLToPath(import.meta.url))

const media = (id) => ({
  m0: { type: 'video', src: `cases/${id}/cover.mp4`, poster: `cases/${id}/cover.jpg` },
  m1: { type: 'image', src: `cases/${id}/1.jpg` },
  m2: { type: 'image', src: `cases/${id}/2.jpg` },
  m3: { type: 'image', src: `cases/${id}/3.jpg` },
})

const manifest = {
  hero: { photo: { type: 'image', src: 'hero.jpg' } },
  cases: CASES.map((c) => ({
    id: c.id,
    year: c.year,
    title: c.title,
    role: c.role,
    goal: c.goal,
    desc: c.desc,
    result: c.result,
    tags: c.tags,
    media: media(c.id),
  })),
}

const out = resolve(here, '..', 'manifest.example.json')
writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n')
console.log('Записано:', out, '—', manifest.cases.length, 'кейсов')
