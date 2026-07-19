import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();

// Перехватываем запросы к изображениям
const imgRequests = [];
const imgFailed = [];
page.on('request', req => {
  if (/\.(webp|jpg|jpeg|png|gif)/.test(req.url())) imgRequests.push(req.url());
});
page.on('requestfailed', req => {
  if (/\.(webp|jpg|jpeg|png|gif)/.test(req.url())) imgFailed.push({ url: req.url(), err: req.failure()?.errorText });
});

await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// Проверяем что есть в первом кейсе
const firstCaseMedia = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img, video')).slice(0, 6);
  return imgs.map(el => ({ tag: el.tagName, src: el.src || el.currentSrc, natural: el.naturalWidth }));
});

console.log('Image requests:', imgRequests.slice(0, 5));
console.log('Failed:', JSON.stringify(imgFailed.slice(0, 5)));
console.log('Media in DOM:', JSON.stringify(firstCaseMedia, null, 2));
await browser.close();
