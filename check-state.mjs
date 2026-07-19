import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Ищем React fiber чтобы посмотреть state
const firstCaseData = await page.evaluate(() => {
  // Смотрим что рендерится в DOM для media-слотов
  const mediaCells = Array.from(document.querySelectorAll('[class*="media"], [class*="Media"]'));
  const imgs = Array.from(document.querySelectorAll('.case-grid img, .case-grid video'));
  return {
    mediaCells: mediaCells.length,
    imgs: imgs.map(i => ({ src: i.src, class: i.className })).slice(0,4),
    allImgs: Array.from(document.querySelectorAll('img')).map(i => i.src).slice(0,10)
  };
});
console.log(JSON.stringify(firstCaseData, null, 2));
await browser.close();
