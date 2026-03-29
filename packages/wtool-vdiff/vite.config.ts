import { resolve } from 'path'
import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        include: ['src/**/*.ts', 'src/**/*.vue'],
        outDir: 'dist',
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
    },
    build: {
      minify: isProd,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'WtoolVdiff',
        fileName: (format) => `wtool-vdiff.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: [],
        output: {
          hoistTransitiveImports: false,
        },
      },
    },
  } as UserConfig
})
