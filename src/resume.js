import { ABOUT, EDUCATION, SKILLS, CASES } from './data.js'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Открывает печатную версию резюме в новом окне и запускает печать (как в исходном экспорте). */
export function downloadResume(lang, liveCases) {
  const isRu = lang === 'ru'
  const summary = ABOUT[lang].map((p) => '<p>' + esc(p) + '</p>').join('')
  const edu = EDUCATION[lang].map((e) => '<div class="row"><span class="yr">' + esc(e.year) + '</span><span>' + esc(e.line) + '</span></div>').join('')
  const skills = SKILLS[lang].map((s) => '<span class="chip">' + esc(s) + '</span>').join('')
  const sourceCases = (liveCases && liveCases.length) ? liveCases : CASES
  const exp = sourceCases.map((c) =>
    '<div class="exp"><div class="exp-h"><span class="exp-role">' + esc(c.role[lang]) +
    '</span><span class="exp-yr">' + esc(c.year) + '</span></div><p class="exp-d">' + esc(c.desc[lang]) + '</p></div>'
  ).join('')

  const L = isRu
    ? { name: 'Алексей Андреевич Вторыгин', role: 'Арт-директор · дизайн-лид', born: 'Дата рождения: 22.10.1990', summary: 'О себе', edu: 'Образование', exp: 'Опыт работы', skills: 'Навыки', tel: 'Телефон', tg: 'Telegram' }
    : { name: 'Aleksey Andreevich Vtorygin', role: 'Art Director · Design Lead', born: 'Date of birth: 22.10.1990', summary: 'Profile', edu: 'Education', exp: 'Experience', skills: 'Skills', tel: 'Phone', tg: 'Telegram' }

  const html =
    '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="utf-8"><title>' + esc(L.name) + ' — CV</title>' +
    '<style>' +
    '@page{size:A4;margin:16mm 16mm;}' +
    '*{box-sizing:border-box;}' +
    'body{margin:0;font-family:"Manrope","Helvetica Neue",Arial,sans-serif;color:#141414;font-size:11px;line-height:1.5;}' +
    '.wrap{max-width:800px;margin:0 auto;padding:24px;}' +
    'header{border-bottom:3px solid #FF6A1A;padding-bottom:14px;margin-bottom:18px;}' +
    'h1{font-family:"Arial Black",sans-serif;font-size:30px;letter-spacing:-.02em;margin:0 0 4px;text-transform:uppercase;}' +
    '.role{color:#FF6A1A;font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase;}' +
    '.meta{color:#666;font-size:11px;margin-top:6px;display:flex;flex-wrap:wrap;gap:14px;}' +
    '.meta a{color:#141414;text-decoration:none;}' +
    'h2{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#FF6A1A;border-bottom:1px solid #e2e2e2;padding-bottom:5px;margin:18px 0 10px;}' +
    'p{margin:0 0 7px;}' +
    '.row{display:flex;gap:12px;margin-bottom:5px;}' +
    '.yr{color:#FF6A1A;font-weight:700;min-width:70px;}' +
    '.exp{margin-bottom:11px;}' +
    '.exp-h{display:flex;justify-content:space-between;align-items:baseline;gap:12px;}' +
    '.exp-role{font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.01em;}' +
    '.exp-yr{color:#888;font-size:10px;white-space:nowrap;}' +
    '.exp-d{color:#444;margin:2px 0 0;}' +
    '.chips{display:flex;flex-wrap:wrap;gap:6px;}' +
    '.chip{border:1px solid #d8d8d8;border-radius:999px;padding:4px 11px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#333;}' +
    '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}' +
    '</style></head><body><div class="wrap">' +
    '<header><h1>' + esc(L.name) + '</h1><div class="role">' + esc(L.role) + '</div>' +
    '<div class="meta"><span>' + esc(L.born) + '</span><a href="tel:+79508679985">' + esc(L.tel) + ': +7 950 867-99-85</a><a href="https://t.me/arhidis1">' + esc(L.tg) + ': @arhidis1</a></div></header>' +
    '<h2>' + esc(L.summary) + '</h2>' + summary +
    '<h2>' + esc(L.exp) + '</h2>' + exp +
    '<h2>' + esc(L.edu) + '</h2>' + edu +
    '<h2>' + esc(L.skills) + '</h2><div class="chips">' + skills + '</div>' +
    '</div><scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},350);};</scr' + 'ipt></body></html>'

  const w = window.open('', '_blank')
  if (!w) return
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
}
