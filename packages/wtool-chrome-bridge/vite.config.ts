import { resolve } from 'path'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import pluginVue2 from '@vitejs/plugin-vue2'
import pluginVue2JSX from '@vitejs/plugin-vue2-jsx'
import pluginBasicSsl from '@vitejs/plugin-basic-ssl'

export default ({ mode }) => {
  const envs = loadEnv(mode, process.cwd(), '')
  const isProd = envs.NODE_ENV === 'production'
  console.log(resolve(__dirname, 'src/index.ts'))
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
        { find: '~ant-design-vue', replacement: resolve('./node_modules/ant-design-vue') },
        { find: 'ant-design-vue', replacement: resolve('./node_modules/ant-design-vue') },
        { find: 'element-ui', replacement: resolve('./node_modules/element-ui') },
        { find: 'lodash-es', replacement: resolve('./node_modules/lodash-es') },

        {
          find: '@aweb-common',
          replacement: resolve('../../packages/aweb-common/src'),
        },
        {
          find: '@aweb-ui',
          replacement: resolve('../../packages/aweb-ui/src'),
        },
        {
          find: /^moment$/,
          replacement: resolve('./node_modules/moment/moment.js'),
        },
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
        fileName: format => `vue-pixel-art.${format}.js`, // 输出文件名
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        // 告诉打包工具 在external配置的 都是外部依赖项  不需要打包
        external: ['vue', 'lodash-es', 'ant-design-vue', 'element-ui'],
      },
      sourcemap: isProd ? false : true,
    },
  } as UserConfig

  return defineConfig(config)
}
