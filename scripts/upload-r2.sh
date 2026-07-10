#!/usr/bin/env bash
# Заливка манифеста и медиа на Cloudflare R2 одной командой.
#
# Ключи R2 НЕ хранятся в файлах — берутся из переменных окружения.
# Получить их: Cloudflare → R2 → Manage R2 API Tokens → Create API Token
# (права Object Read & Write на бакет alexeyportfolio).
#
# Использование:
#   export R2_ACCESS_KEY_ID=xxxxxxxx
#   export R2_SECRET_ACCESS_KEY=yyyyyyyy
#   ./scripts/upload-r2.sh            # залить manifest.json + всё из ./media/
#   ./scripts/upload-r2.sh --dry      # показать, что будет залито, без загрузки
set -euo pipefail

# --- настройки бакета (при необходимости поменяйте) ---
ENDPOINT="https://97d34473f0da8ee3ea471f9b5b635e96.r2.cloudflarestorage.com"
BUCKET="alexeyportfolio"
# ------------------------------------------------------

cd "$(dirname "$0")/.."

if ! command -v rclone >/dev/null 2>&1; then
  echo "✗ rclone не установлен. Установите: brew install rclone" >&2
  exit 1
fi
if [[ -z "${R2_ACCESS_KEY_ID:-}" || -z "${R2_SECRET_ACCESS_KEY:-}" ]]; then
  echo "✗ Заданы не все ключи. Экспортируйте R2_ACCESS_KEY_ID и R2_SECRET_ACCESS_KEY." >&2
  exit 1
fi

if [[ ! -f ./manifest.json ]]; then
  echo "✗ Нет react-site/manifest.json. Создайте его из шаблона и отредактируйте:" >&2
  echo "    cp manifest.example.json manifest.json" >&2
  exit 1
fi

DRY=""
[[ "${1:-}" == "--dry" ]] && DRY="--dry-run"

# Определяем remote "r2" через переменные окружения — файл конфига rclone
# не создаётся, секреты живут только в памяти процесса.
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export RCLONE_CONFIG_R2_ENDPOINT="${ENDPOINT}"
export RCLONE_CONFIG_R2_REGION=auto
export RCLONE_CONFIG_R2_ACL=private

echo "→ Заливаю manifest.json в bucket ${BUCKET} ..."
rclone copyto ./manifest.json "r2:${BUCKET}/manifest.json" $DRY --s3-no-check-bucket -v

if [[ -d ./media ]]; then
  echo "→ Заливаю ./media/ → ${BUCKET}/ ..."
  rclone copy ./media "r2:${BUCKET}/" $DRY --s3-no-check-bucket --progress -v
else
  echo "ℹ Папки ./media/ нет — залит только манифест. Сложите медиа в react-site/media/ по путям из манифеста."
fi

echo "✓ Готово."
