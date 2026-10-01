import { resolve } from 'path'
import { defineConfig, type UserConfig } from 'vite'
import pluginVue2 from '@vitejs/plugin-vue2'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      pluginVue2(),
      dts({
        include: ['src/**/*.ts', 'src/**/*.vue'],
        outDir: 'dist',
        compilerOptions: {
          rootDir: resolve(__dirname, 'src'),
        },
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
    },
    build: {
      minify: isProd,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'WtoolBezier',
        fileName: format => `wtool-bezier.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['vue', 'lodash-es', 'konva'],
        output: {
          hoistTransitiveImports: false,
        },
      },
    },
  } as UserConfig
})
