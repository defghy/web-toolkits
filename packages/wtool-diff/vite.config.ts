import { resolve } from 'path'
import { defineConfig, type UserConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => {
  // dev 模式：以 site/ 为入口，同时加载 Svelte + Vue 插件
  if (command === 'serve') {
    return {
      root: resolve(__dirname, 'site'),
      plugins: [
        svelte({
          configFile: resolve(__dirname, 'svelte.config.js'),
        }),
        vue(),
      ],
      resolve: {
        extensions: ['.js', '.ts', '.svelte', '.vue', '.json'],
      },
    } as UserConfig
  }

  // build 模式：仅构建 Svelte 库
  return {
    plugins: [
      svelte(),
      dts({
        insertTypesEntry: true,
        include: ['src/**/*.ts', 'src/**/*.svelte'],
        outDir: 'dist',
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.svelte', '.json'],
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'DiffView',
        fileName: (format) => `diff-view.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['svelte', /^svelte\//],
        output: {
          hoistTransitiveImports: false,
        },
      },
    },
  } as UserConfig
})
