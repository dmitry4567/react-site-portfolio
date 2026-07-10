import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// База './' — чтобы собранный сайт открывался из любой папки (в т.ч. как статические файлы).
export default defineConfig({
  base: './',
  plugins: [react()],
})
