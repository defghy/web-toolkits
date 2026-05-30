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
        insertTypesEntry: true,
        include: ['src/**/*.ts', 'src/**/*.vue'],
        outDir: 'dist',
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
      alias: {
        vue: resolve(__dirname, 'node_modules/vue/dist/vue.runtime.esm.js'),
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      minify: isProd,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'WtoolPixelCore',
        fileName: format => `wtool-pixel-core.${format}.js`,
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
