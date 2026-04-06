import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [vue()],
  server: {
    port: Number(5443),
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
})
