import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [
    vue(),
  ],
  server: {
    fs: {
      // 允许访问上级 dist/ 目录
      allow: [resolve(__dirname, '..')],
    },
  },
})
