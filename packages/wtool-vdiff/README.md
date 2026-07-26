# @yuhufe/wtool-vdiff

**Demo**: [https://defghy.github.io/web-toolkits/v-diff/](https://defghy.github.io/web-toolkits/v-diff/)

基于 Monaco 的框架无关 DiffViewer，可集成到 React、Vue、原生 JS 等前端项目。

---

## 特性

- **框架无关** ：通过 Web Component 封装，函数调用即可挂载
- **双模式输入** ：支持 `diffPatch`（unified diff）和 `diffPair`（文件对）
- **自适应高度** ：按变更行数计算编辑器高度，减少空白
- **折叠未变更区域** ：默认折叠无差异区域，保留变更上下文
- **顶部工具栏** ：提供文件名、增删行统计、viewed 标记和 raw 模式
- **文件列表 Diff** ：通过文件数组生成可搜索的文件树，支持选择联动和虚拟滚动

---

## 安装

```bash
npm install @yuhufe/wtool-vdiff
# 或
pnpm add @yuhufe/wtool-vdiff
```

---

## 快速开始

### 方式一：`diffPatch`（unified diff）

```typescript
import { createDiffViewer } from '@yuhufe/wtool-vdiff'

const viewer = createDiffViewer(document.getElementById('diff-container')!, {
  diffPatch: `--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,6 @@
 import { foo } from './foo'
-const x = 1
+const x = 2
+const y = 3
 export { foo }`,
})

// 更新
viewer.update({ diffPatch: newPatch })

// 销毁
viewer.destroy()
```

### 方式二：`diffPair`（文件对）

```typescript
import { createDiffViewer } from '@yuhufe/wtool-vdiff'

const viewer = createDiffViewer(document.getElementById('diff-container')!, {
  diffPair: [
    { filename: 'src/index.ts', content: 'const x = 1\nexport { foo }' },
    { filename: 'src/index.ts', content: 'const x = 2\nconst y = 3\nexport { foo }' },
  ],
  language: 'typescript',
})
```

---

## 文件列表 Diff

`createDiffFiles` 展示可搜索的文件树和虚拟滚动 Diff 列表，选择文件时自动滚动并高亮。

```html
<div id="diff-files-container"></div>

<style>
  #diff-files-container {
    width: 100%;
    height: 560px;
    overflow: hidden;
  }
</style>
```

```typescript
import { createDiffFiles, type DiffFile } from '@yuhufe/wtool-vdiff'

const diffFiles: DiffFile[] = [
  {
    diffPatch: `--- src/index.ts
+++ src/index.ts
@@ -1,2 +1,3 @@
 import { foo } from './foo'
-export { foo }
+const version = 2
+export { foo, version }`,
  },
  {
    diffPair: [
      {
        filename: 'src/utils/sum.ts',
        content: 'export const sum = (a: number, b: number) => a + b',
      },
      {
        filename: 'src/utils/sum.ts',
        content: 'export function sum(a: number, b: number) {\n  return a + b\n}',
      },
    ],
  },
]

const filesViewer = createDiffFiles(document.getElementById('diff-files-container')!, {
  diffFiles,
  viewerStyle: { maxHeight: '360px' },
})

// 销毁
filesViewer.destroy()
```

> 组件根据 `fullPath` 构建目录树。外层容器需设置明确高度，且每个文件的最终 `fullPath` 必须唯一。文件内容通过 `diffPatch` 或 `diffPair` 提供。

省略 `fullPath` 时，组件按以下顺序推导文件路径：

1. 显式 `fullPath`
2. `diffPair` 中修改后文件的 `filename`，其次为原文件
3. `diffPatch` 的 `+++` 头部

`diffPatch` 中的文件名会原样保留，也可通过 `fullPath` 覆盖。无法确定路径时，组件会抛出带数组下标的 `TypeError`。

---

## loader 配置

库通过 `@monaco-editor/loader` 按需加载 Monaco。默认使用 jsDelivr CDN，生产环境建议本地加载。

**方式一：自定义 CDN 路径**

```typescript
import { loader } from '@yuhufe/wtool-vdiff'

loader.config({
  paths: { vs: 'https://your-cdn.example.com/monaco-editor/0.53.0/min/vs' },
})
```

**方式二：本地加载（Vite 推荐）**

```typescript
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import { loader } from '@yuhufe/wtool-vdiff'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  },
}

loader.config({ monaco })
```

> 请在首次调用 `createDiffViewer` 前配置 `loader`。

---

## API

### `createDiffViewer(target, props?)`

挂载 DiffViewer。

| 参数     | 类型              | 必填 | 说明     |
| -------- | ----------------- | ---- | -------- |
| `target` | `HTMLElement`     | ✅   | 挂载容器 |
| `props`  | `DiffViewerProps` | ❌   | 初始属性 |

**返回值：`DiffViewerInstance`**

| 方法      | 签名                                        | 说明         |
| --------- | ------------------------------------------- | ------------ |
| `update`  | `(props: Partial<DiffViewerProps>) => void` | 更新 props   |
| `destroy` | `() => void`                                | 销毁并从 DOM 移除 |

---

### `createDiffFiles(target, props?)`

挂载文件列表 Diff。

| 参数     | 类型             | 必填 | 说明     |
| -------- | ---------------- | ---- | -------- |
| `target` | `HTMLElement`    | ✅   | 挂载容器 |
| `props`  | `DiffFilesProps` | ❌   | 初始属性 |

**返回值：`DiffFilesInstance`**

| 方法      | 签名                                       | 说明         |
| --------- | ------------------------------------------ | ------------ |
| `update`  | `(props: Partial<DiffFilesProps>) => void` | 更新 props   |
| `destroy` | `() => void`                               | 销毁并从 DOM 移除 |

### `DiffFilesProps`

| 属性          | 类型                   | 默认值 | 说明                  |
| ------------- | ---------------------- | ------ | --------------------- |
| `diffFiles`   | `DiffFile[]`           | `[]`   | 文件数组              |
| `viewerStyle` | `WtoolDiffViewerStyle` | `{}`   | 单个 DiffViewer 的样式 |

### `DiffFile`

| 属性          | 类型                                              | 必填 | 说明                                                     |
| ------------- | ------------------------------------------------- | ---- | -------------------------------------------------------- |
| `fullPath`    | `string`                                          | ❌   | 文件完整路径；省略时根据 `diffPair` 或 `diffPatch` 推导  |
| `diffPatch`   | `string`                                          | ❌   | Unified diff 字符串，与 `diffPair` 二选一                |
| `diffPair`    | `{ filename: string; content: string \| null }[]` | ❌   | 原文件和修改后文件                                       |

> `FileTree` 是 `DiffFile` 的废弃别名，建议迁移到 `DiffFile`。

---

### `DiffViewerProps`

| 属性           | 类型                                      | 默认值        | 说明                                                  |
| -------------- | ----------------------------------------- | ------------- | ----------------------------------------------------- |
| `diffPatch`    | `string`                                  | `''`          | Unified diff 字符串，与 `diffPair` 二选一             |
| `diffPair`     | `{ filename: string; content: string }[]` | `[]`          | 原文件和修改后文件，与 `diffPatch` 二选一             |
| `language`     | `string`                                  | `'plaintext'` | Monaco 语言标识，如 `'typescript'`、`'python'`        |
| `options`      | `DiffEditorOptions`                       | `{}`          | 透传至 Monaco Diff Editor                             |
| `modelOptions` | `ModelOptions`                            | `{}`          | 透传至 Monaco 文本模型                                |
| `viewerStyle`  | `WtoolDiffViewerStyle`                    | —             | 外层尺寸                                              |

---

### `WtoolDiffViewerStyle`

| 属性        | 类型     | 说明                           |
| ----------- | -------- | ------------------------------ |
| `width`     | `string` | 宽度，默认 `100%`              |
| `height`    | `string` | 固定高度，优先于自适应高度     |
| `minHeight` | `string` | 最小高度，默认 `100px`         |
| `maxHeight` | `string` | 最大高度，默认 `250px`         |

> 尺寸支持 `px` 和 `vh`。

---

### `DiffEditorOptions`（Monaco 透传）

选项见 [Monaco Editor 官方文档](https://microsoft.github.io/monaco-editor/docs.html)。

---
