import { resolve } from 'path'
import { defineConfig } from 'vite'
import pluginVue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  root: resolve(__dirname),
  base: '/web-toolkits/bezier-demo/',
  plugins: [pluginVue2()],
  server: {
    port: Number(4937),
    open: '/web-toolkits/bezier-demo/',
    fs: {
      allow: [resolve(__dirname, '..'), resolve(__dirname, '../../../node_modules')],
    },
  },
  resolve: {
    alias: {
      vue: resolve(__dirname, '../node_modules/vue/dist/vue.runtime.esm.js'),
      '@': resolve(__dirname),
      '@yuhufe/wtool-bezier': resolve(__dirname, '../src/index.ts'),
    },
  },
})
