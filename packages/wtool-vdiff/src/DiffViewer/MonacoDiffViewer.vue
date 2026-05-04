<template>
  <div ref="containerEl" class="monaco-editor-container" :class="{ 'hide-unchanged-actions': !canUnchangeVisible }" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'
import { useDiffViewer } from './useDiffView'

type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
type ModelOptions = Monaco.editor.ITextModelUpdateOptions

const props = withDefaults(
  defineProps<{
    originalCode?: string
    modifiedCode?: string
    language?: string
    options?: DiffEditorOptions
    modelOptions?: ModelOptions
  }>(),
  {
    originalCode: '',
    modifiedCode: '',
    language: 'plaintext',
    options: () => ({}),
    modelOptions: () => ({}),
  }
)

const emit = defineEmits<{ renderComplete: [] }>()

const { funcs } = useDiffViewer()
const canUnchangeVisible = funcs.canUnchangeVisible

const containerEl = ref<HTMLDivElement | null>(null)
const monacoInstance = shallowRef<typeof Monaco | null>(null)
const editor = shallowRef<Monaco.editor.IStandaloneDiffEditor | null>(null)
const originalModel = shallowRef<Monaco.editor.ITextModel | null>(null)
const modifiedModel = shallowRef<Monaco.editor.ITextModel | null>(null)

let disposed = false

onMounted(() => {
  disposed = false

  const init = async () => {
    const monaco = await loader.init()
    if (disposed || !containerEl.value) return

    monacoInstance.value = monaco
    originalModel.value = monaco.editor.createModel(props.originalCode, props.language)
    modifiedModel.value = monaco.editor.createModel(props.modifiedCode, props.language)

    editor.value = monaco.editor.createDiffEditor(containerEl.value, {
      automaticLayout: true,
      readOnly: true,
      renderSideBySide: true,
      useInlineViewWhenSpaceIsLimited: false,
      scrollBeyondLastLine: false,
      hideUnchangedRegions: {
        enabled: true,
        contextLineCount: 3,
      },
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      ...props.options,
    })
    editor.value.setModel({
      original: originalModel.value,
      modified: modifiedModel.value,
    })

    if (Object.keys(props.modelOptions).length > 0) {
      originalModel.value.updateOptions(props.modelOptions)
      modifiedModel.value.updateOptions(props.modelOptions)
    }

    // 仅在首次 diff 计算完成后统计行数，之后立即注销监听。
    // Monaco 用 endLineNumber === 0 表示该侧无变更行（纯删除或纯新增），span 需特殊处理。
    const onDidUpdateDiffDisposable = editor.value.onDidUpdateDiff(() => {
      const changes = editor.value?.getLineChanges() ?? []
      const span = (s: number, e: number) => (e === 0 ? 0 : e - s + 1)
      const added = changes.reduce((n, c) => n + span(c.modifiedStartLineNumber, c.modifiedEndLineNumber), 0)
      const removed = changes.reduce((n, c) => n + span(c.originalStartLineNumber, c.originalEndLineNumber), 0)
      funcs.updateChangedLines?.({ added, removed })
      emit('renderComplete')
      onDidUpdateDiffDisposable.dispose()
    })
  }

  void init()
})

onBeforeUnmount(() => {
  disposed = true
  editor.value?.dispose()
  originalModel.value?.dispose()
  modifiedModel.value?.dispose()
  editor.value = null
  originalModel.value = null
  modifiedModel.value = null
  monacoInstance.value = null
})

watch(
  () => props.options,
  opts => {
    if (!editor.value) return
    editor.value.updateOptions(opts)
  },
  { deep: true }
)

watch(
  () => props.originalCode,
  v => {
    if (!originalModel.value) return
    if (originalModel.value.getValue() !== v) {
      originalModel.value.setValue(v)
    }
  }
)

watch(
  () => props.modifiedCode,
  v => {
    if (!modifiedModel.value) return
    if (modifiedModel.value.getValue() !== v) {
      modifiedModel.value.setValue(v)
    }
  }
)

watch(
  () => props.language,
  lang => {
    const monaco = monacoInstance.value
    const om = originalModel.value
    const mm = modifiedModel.value
    if (!monaco || !om || !mm) return
    monaco.editor.setModelLanguage(om, lang)
    monaco.editor.setModelLanguage(mm, lang)
  }
)

watch(
  () => props.modelOptions,
  mo => {
    if (!originalModel.value || !modifiedModel.value) return
    originalModel.value.updateOptions(mo)
    modifiedModel.value.updateOptions(mo)
  },
  { deep: true }
)
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
/* patch 模式：未改动区域为空行，隐藏 monaco 内置的展开未改动区域按钮（非 scoped，配合 JS class 控制） */
.monaco-editor-container.hide-unchanged-actions {
  .diff-hidden-lines-widget {
    cursor: not-allowed;
    .diff-hidden-lines {
      pointer-events: none;
      opacity: 0.75;
    }
  }
}
</style>
