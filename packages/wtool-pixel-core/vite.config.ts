import { resolve } from 'path'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import pluginVue2 from '@vitejs/plugin-vue2'
import pluginVue2JSX from '@vitejs/plugin-vue2-jsx'

export default ({ mode }) => {
  const envs = loadEnv(mode, process.cwd(), '')
  const isProd = envs.NODE_ENV === 'production'
  const config = {
    publicDir: resolve('./public'), // 静态资源路径
    plugins: [pluginVue2(), pluginVue2JSX()].filter(f => !!f),
    define: {
      'process.env': {
        VITE_ENV: true,
      },
    },
    resolve: {
      extensions: ['.js', '.vue', '.json', '.ts', '.jsx', '.tsx'],
      alias: [
        { find: '@', replacement: resolve('src') },
        { find: '~@', replacement: resolve('src') },
        { find: /^vue$/, replacement: resolve('./node_modules/vue/dist/vue.runtime.esm.js') },
        { find: 'lodash-es', replacement: resolve('./node_modules/lodash-es') },
      ],
    },
    css: {
      postcss: {
        plugins: [],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [],
        loader: {
          '.js': 'jsx',
        },
      },
    },

    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'), // 入口文件
        name: 'PixelArt', // UMD 模块名称
        fileName: format => `wtool-pixel-core.${format}.js`, // 输出文件名
        formats: ['es', 'cjs'],
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        // 告诉打包工具 在external配置的 都是外部依赖项  不需要打包
        external: ['@yuhufe/web-common', 'vue', 'lodash-es', 'konva', 'vue-konva'],
      },
      sourcemap: isProd ? false : true,
    },
  } as UserConfig

  return defineConfig(config)
}
