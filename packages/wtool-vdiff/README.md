# @yuhufe/wtool-vdiff

**Demo**: [https://defghy.github.io/web-toolkits/v-diff/](https://defghy.github.io/web-toolkits/v-diff/)

基于 Monaco 的 DiffViewer。 **框架无关** —— 可直接集成到任何前端项目（React、Vue、原生 JS 等）中。

---

## 特性

- **框架无关** ：通过 Web Component 封装，函数调用即可挂载，无需 Vue 项目
- **双模式输入** ：支持 `diffPatch`（unified diff 字符串）与 `diffPair`（原始文件对）两种数据格式
- **自适应高度** ：根据实际变更行数自动计算编辑器高度，避免大量空白
- **折叠未变更区域** ：默认折叠无差异区域，仅保留变更附近的上下文行
- **顶部工具栏** ：内置文件名展示、增删行数统计、viewed 标记、raw 展开模式
- **文件列表 Diff** ：提供文件树搜索、文件选择联动和虚拟滚动，支持扁平列表与嵌套目录树

---

## 安装

```bash
npm install @yuhufe/wtool-vdiff
# 或
pnpm add @yuhufe/wtool-vdiff
```

---

## 快速开始

### 方式一：`diffPatch` 模式（unified diff 字符串）

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

// 动态更新内容
viewer.update({ diffPatch: newPatch })

// 销毁
viewer.destroy()
```

### 方式二：`diffPair` 模式（完整文件对）

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

`createDiffFiles` 通过 Web Component 挂载文件列表 Diff，不依赖 Vue。左侧展示可搜索的文件树，右侧通过虚拟滚动展示每个文件的 Diff；点击文件树节点时，右侧会滚动到对应文件并高亮。

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
import { createDiffFiles, type FileTree } from '@yuhufe/wtool-vdiff'

const diffFiles: FileTree[] = [
  {
    fullPath: 'src/index.ts',
    diffPatch: `--- a/src/index.ts
+++ b/src/index.ts
@@ -1,2 +1,3 @@
 import { foo } from './foo'
-export { foo }
+const version = 2
+export { foo, version }`,
  },
  {
    fullPath: 'src/utils/sum.ts',
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

// 不再使用时销毁
filesViewer.destroy()
```

> 文件列表使用虚拟滚动，外层容器必须具有明确高度。每个文件的 `fullPath` 必须唯一；文件内容可通过 `diffPatch` 或 `diffPair` 提供。

`diffFiles` 也可以使用嵌套目录树：

```typescript
const diffFiles: FileTree[] = [
  {
    name: 'src',
    isDirectory: true,
    children: [
      {
        name: 'index.ts',
        diffPatch: patch,
      },
    ],
  },
]
```

---

## loader 配置

库内部通过 `@monaco-editor/loader` 按需加载 Monaco。默认走 jsDelivr CDN，生产环境建议改为本地 bundle。

**方式一：自定义 CDN 路径**

```typescript
import { loader } from '@yuhufe/wtool-vdiff'

loader.config({
  paths: { vs: 'https://your-cdn.example.com/monaco-editor/0.53.0/min/vs' },
})
```

**方式二：从 node_modules 本地加载（Vite 项目推荐）**

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

> `loader.config` 必须在任意 `createDiffViewer` 调用之前执行。

---

## API

### `createDiffViewer(target, props?)`

在目标元素内创建并挂载 diff 查看器，返回 `DiffViewerInstance` 实例。

| 参数     | 类型              | 必填 | 说明                            |
| -------- | ----------------- | ---- | ------------------------------- |
| `target` | `HTMLElement`     | ✅   | 挂载目标容器元素                |
| `props`  | `DiffViewerProps` | ❌   | 初始化属性（见下方 Props 说明） |

**返回值：`DiffViewerInstance`**

| 方法      | 签名                                        | 说明                    |
| --------- | ------------------------------------------- | ----------------------- |
| `update`  | `(props: Partial<DiffViewerProps>) => void` | 动态更新 props          |
| `destroy` | `() => void`                                | 销毁查看器并从 DOM 移除 |

---

### `createDiffFiles(target, props?)`

在目标元素内创建并挂载文件列表 Diff，返回 `DiffFilesInstance` 实例。

| 参数     | 类型             | 必填 | 说明             |
| -------- | ---------------- | ---- | ---------------- |
| `target` | `HTMLElement`    | ✅   | 挂载目标容器元素 |
| `props`  | `DiffFilesProps` | ❌   | 初始化属性       |

**返回值：`DiffFilesInstance`**

| 方法      | 签名                                       | 说明                  |
| --------- | ------------------------------------------ | --------------------- |
| `update`  | `(props: Partial<DiffFilesProps>) => void` | 动态更新 props        |
| `destroy` | `() => void`                               | 销毁组件并从 DOM 移除 |

### `DiffFilesProps`

| 属性          | 类型                   | 默认值 | 说明                             |
| ------------- | ---------------------- | ------ | -------------------------------- |
| `diffFiles`   | `FileTree[]`           | `[]`   | 文件列表或嵌套目录树             |
| `viewerStyle` | `WtoolDiffViewerStyle` | `{}`   | 应用于每个文件 DiffViewer 的样式 |

### `FileTree`

| 属性          | 类型                                              | 必填 | 说明                                      |
| ------------- | ------------------------------------------------- | ---- | ----------------------------------------- |
| `fullPath`    | `string`                                          | ✅   | 文件完整路径，同时作为文件的唯一标识      |
| `name`        | `string`                                          | ❌   | 文件名或目录名，嵌套目录树中建议提供      |
| `diffPatch`   | `string`                                          | ❌   | Unified diff 字符串，与 `diffPair` 二选一 |
| `diffPair`    | `{ filename: string; content: string \| null }[]` | ❌   | 原始文件与修改后文件，数组长度为 2        |
| `isDirectory` | `boolean`                                         | ❌   | 是否为目录节点                            |
| `children`    | `FileTree[]`                                      | ❌   | 子目录或文件，仅目录节点使用              |

---

### Props（`DiffViewerProps`）

| 属性           | 类型                                      | 默认值        | 说明                                                                          |
| -------------- | ----------------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `diffPatch`    | `string`                                  | `''`          | Unified diff 格式字符串（与 `diffPair` 二选一）                               |
| `diffPair`     | `{ filename: string; content: string }[]` | `[]`          | 原始文件对，数组长度为 2，分别为原始文件与修改后文件（与 `diffPatch` 二选一） |
| `language`     | `string`                                  | `'plaintext'` | Monaco 语言标识，影响语法高亮（如 `'typescript'`、`'python'`）                |
| `options`      | `DiffEditorOptions`                       | `{}`          | Monaco `IStandaloneDiffEditorConstructionOptions`，透传给 Monaco 编辑器       |
| `modelOptions` | `ModelOptions`                            | `{}`          | Monaco `ITextModelUpdateOptions`，透传给文本模型                              |
| `viewerStyle`  | `WtoolDiffViewerStyle`                    | —             | 查看器外层样式（宽高）                                                        |

---

### `WtoolDiffViewerStyle`

| 属性        | 类型     | 说明                             |
| ----------- | -------- | -------------------------------- |
| `width`     | `string` | 查看器宽度，默认 `100%`          |
| `height`    | `string` | 固定高度（设置后忽略自适应逻辑） |
| `minHeight` | `string` | 自适应高度最小值，默认 `100px`   |
| `maxHeight` | `string` | 自适应高度最大值，默认 `250px`   |

> 支持 `px` 和 `vh` 单位。当 `height` 显式设置时，`minHeight` / `maxHeight` 无效。

---

### `DiffEditorOptions`（Monaco 透传）

完整选项参考 [Monaco Editor 官方文档](https://microsoft.github.io/monaco-editor/docs.html)。

---
