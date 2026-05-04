# @yuhufe/wtool-vdiff

**Demo**: <a href="https://defghy.github.io/web-toolkits/v-diff/" target="_blank">https://defghy.github.io/web-toolkits/v-diff/</a>

基于 Monaco 的 DiffViewer。 **框架无关** —— 可直接集成到任何前端项目（React、Vue、原生 JS 等）中。

---

## 特性

- **框架无关** ：通过 Web Component 封装，函数调用即可挂载，无需 Vue 项目
- **双模式输入** ：支持 `diffPatch`（unified diff 字符串）与 `diffPair`（原始文件对）两种数据格式
- **自适应高度** ：根据实际变更行数自动计算编辑器高度，避免大量空白
- **折叠未变更区域** ：默认折叠无差异区域，仅保留变更附近的上下文行
- **顶部工具栏** ：内置文件名展示、增删行数统计、viewed 标记、raw 展开模式

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

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `target` | `HTMLElement` | ✅ | 挂载目标容器元素 |
| `props` | `DiffViewerProps` | ❌ | 初始化属性（见下方 Props 说明） |

**返回值：`DiffViewerInstance`**

| 方法 | 签名 | 说明 |
|------|------|------|
| `update` | `(props: Partial<DiffViewerProps>) => void` | 动态更新 props |
| `destroy` | `() => void` | 销毁查看器并从 DOM 移除 |

---

### Props（`DiffViewerProps`）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `diffPatch` | `string` | `''` | Unified diff 格式字符串（与 `diffPair` 二选一） |
| `diffPair` | `{ filename: string; content: string }[]` | `[]` | 原始文件对，数组长度为 2，分别为原始文件与修改后文件（与 `diffPatch` 二选一） |
| `language` | `string` | `'plaintext'` | Monaco 语言标识，影响语法高亮（如 `'typescript'`、`'python'`） |
| `options` | `DiffEditorOptions` | `{}` | Monaco `IStandaloneDiffEditorConstructionOptions`，透传给 Monaco 编辑器 |
| `modelOptions` | `ModelOptions` | `{}` | Monaco `ITextModelUpdateOptions`，透传给文本模型 |
| `viewerStyle` | `WtoolDiffViewerStyle` | — | 查看器外层样式（宽高） |

---

### `WtoolDiffViewerStyle`

| 属性 | 类型 | 说明 |
|------|------|------|
| `width` | `string` | 查看器宽度，默认 `100%` |
| `height` | `string` | 固定高度（设置后忽略自适应逻辑） |
| `minHeight` | `string` | 自适应高度最小值，默认 `100px` |
| `maxHeight` | `string` | 自适应高度最大值，默认 `250px` |

> 支持 `px` 和 `vh` 单位。当 `height` 显式设置时，`minHeight` / `maxHeight` 无效。

---

### `DiffEditorOptions`（Monaco 透传）

完整选项参考 [Monaco Editor 官方文档](https://microsoft.github.io/monaco-editor/docs.html)。

---



