import { resolve } from 'path'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const envs = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'
  return {
    publicDir: resolve('./public'), // 静态资源路径
    plugins: [
      dts({
        insertTypesEntry: true,
        include: ['src/**/*.ts'],
        outDir: 'dist',
      }),
    ].filter(f => !!f),
    define: {
      'process.env': {
        VITE_ENV: true,
      },
    },
    resolve: {
      extensions: ['.js', '.vue', '.json', '.ts', '.jsx', '.tsx'],
      alias: [{ find: '@', replacement: resolve('src') }],
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
      watch: isProd ? null : {},
      lib: {
        entry: resolve(__dirname, 'src/index.ts'), // 入口文件
        name: 'WebToolBridge', // UMD 模块名称
        fileName: format => `browser-bridge.${format}.js`, // 输出文件名
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        // 告诉打包工具 在external配置的 都是外部依赖项  不需要打包
        external: [],
      },
      sourcemap: isProd ? false : true,
    },
  } as UserConfig
})
