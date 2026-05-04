import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: resolve(__dirname),
  base: '/web-toolkits/v-diff/',
  plugins: [vue()],
  resolve: {
    alias: {
      vue: resolve(__dirname, '../node_modules/vue/dist/vue.esm-bundler.js'),
      '@': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: Number(5443),
    fs: {
      allow: [resolve(__dirname, '..'), resolve(__dirname, '../../../node_modules')],
    },
  },
})
