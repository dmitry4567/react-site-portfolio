# Портфолио Алексея Вторыгина — React

Сайт-портфолио, перенесённый из экспорта Claude Design в полноценное React-приложение (Vite).

## Запуск

```bash
npm install
npm run dev      # локальная разработка → http://localhost:5173
npm run build    # прод-сборка в папку dist/
npm run preview  # предпросмотр прод-сборки
```

Готовая статика (`dist/`) — обычные файлы, открывается на любом хостинге или через `npm run preview`.

## Структура

- `src/App.jsx` — вся страница (nav, hero, кейсы, about, skills, timeline, contact)
- `src/data.js` — двуязычный контент (RU/EN); кейсы здесь используются как фолбэк, если R2 недоступен
- `src/config.js` — базовый URL R2 и сборка ссылок на медиа
- `src/manifest.js` — загрузка `manifest.json` с R2 (тексты кейсов + медиа)
- `src/components/` — компоненты дизайн-системы: Button, Marquee, SectionHeading, Tag, ContactLink, MediaSlot
- `src/effects.js` — canvas-фон, параллакс, reveal-анимации
- `src/resume.js` — генерация печатного резюме (кнопка «Скачать резюме»)
- `src/index.css` — токены дизайн-системы + @font-face
- `public/fonts/` — шрифты Unbounded / Manrope / JetBrains Mono (woff2)
- `manifest.example.json` — шаблон манифеста для загрузки на R2
- `scripts/gen-manifest.mjs` — регенерация шаблона манифеста из `data.js`

## Медиа с Cloudflare R2

Фото и видео кейсов, а также тексты кейсов сайт грузит из объектного хранилища
Cloudflare R2 через один файл `manifest.json`. Это позволяет добавлять новые кейсы
**без пересборки сайта** — достаточно залить файлы и дописать манифест.

### Первичная настройка

1. Задайте базовый URL бакета в `.env` (см. `.env.example`):
   ```
   VITE_R2_BASE=https://pub-xxxxxxxxxxxx.r2.dev
   ```
   Это r2.dev-поддомен бакета или привязанный к нему кастомный домен.
2. Включите на бакете CORS, чтобы браузер мог читать `manifest.json` и медиа.
   В настройках бакета R2 → CORS Policy:
   ```json
   [{ "AllowedOrigins": ["*"], "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["*"] }]
   ```
   (вместо `*` можно указать домен сайта).
3. Возьмите `manifest.example.json`, переименуйте в `manifest.json` и залейте в корень бакета.
4. Залейте медиа по путям из манифеста (по умолчанию `cases/<id>/...`, `hero.jpg`).

Пути в манифесте относительны базового URL. Пример структуры бакета:
```
manifest.json
hero.jpg
cases/arkhipova/cover.mp4
cases/arkhipova/cover.jpg   ← постер для видео
cases/arkhipova/1.jpg
cases/arkhipova/2.jpg
cases/arkhipova/3.jpg
```

### Как добавить новый кейс

1. Залейте медиа кейса в бакет (например в `cases/<новый-id>/`).
2. Добавьте объект кейса в массив `cases` внутри `manifest.json`:
   ```json
   {
     "id": "новый-id",
     "year": "2025",
     "title":  { "ru": "Название", "en": "Title" },
     "role":   { "ru": "Роль · Компания", "en": "Role · Company" },
     "goal":   { "ru": "Цель", "en": "Goal" },
     "desc":   { "ru": "Описание", "en": "Overview" },
     "result": { "ru": "Результат", "en": "Result" },
     "tags":   { "ru": ["Тег"], "en": ["Tag"] },
     "media": {
       "m0": { "type": "video", "src": "cases/новый-id/cover.mp4", "poster": "cases/новый-id/cover.jpg" },
       "m1": { "type": "image", "src": "cases/новый-id/1.jpg" },
       "m2": { "type": "image", "src": "cases/новый-id/2.jpg" },
       "m3": { "type": "image", "src": "cases/новый-id/3.jpg" }
     }
   }
   ```
   Слот `m0` — крупная обложка (image или video), `m1/m2/m3` — три квадратных превью.
   Любой слот можно опустить — на его месте останется плейсхолдер.
3. Сохраните `manifest.json` обратно в бакет. Изменения появятся на сайте сразу.

Регенерировать шаблон из `data.js`: `node scripts/gen-manifest.mjs`.

### Заливка на R2 одной командой (rclone)

Ключи R2 не хранятся в файлах — берутся из переменных окружения.
Получить их: Cloudflare → R2 → **Manage R2 API Tokens** → создать токен с правами
Object Read & Write на бакет `alexeyportfolio`.

```bash
# 1. один раз установить rclone
brew install rclone

# 2. подготовить локально
cp manifest.example.json manifest.json      # отредактировать под свои кейсы
mkdir -p media && ...                        # сложить сюда файлы по путям из манифеста,
                                             #   напр. media/hero.jpg, media/cases/<id>/1.jpg

# 3. залить (ключи из токена R2)
export R2_ACCESS_KEY_ID=xxxxxxxx
export R2_SECRET_ACCESS_KEY=yyyyyyyy
./scripts/upload-r2.sh --dry                 # проверить, что именно зальётся
./scripts/upload-r2.sh                        # залить manifest.json + media/
```

Структура локальной папки `media/` повторяет пути из манифеста и попадает в корень бакета:
```
media/hero.jpg                 → alexeyportfolio/hero.jpg
media/cases/arkhipova/1.jpg    → alexeyportfolio/cases/arkhipova/1.jpg
```

## Что работает

- Переключение языка RU/EN (сохраняется в localStorage)
- Ленивая подгрузка кейсов при скролле + кнопка «Показать ещё»
- Анимации появления секций, бегущая строка, параллакс, интерактивный canvas-фон
- Фото и видео кейсов + тексты кейсов грузятся с Cloudflare R2 через `manifest.json`
- Генерация резюме в новом окне с печатью/сохранением в PDF
