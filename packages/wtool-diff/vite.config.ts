import { resolve } from 'path'
import { defineConfig, type UserConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

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
      watch: isProd ? null : {},
      minify: isProd,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'DiffView',
        fileName: (format) => `diff-view.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        // Custom Elements 需要内置 svelte 运行时，不外化
        external: [],
        output: {
          hoistTransitiveImports: false,
        },
      },
    },
  } as UserConfig
})
