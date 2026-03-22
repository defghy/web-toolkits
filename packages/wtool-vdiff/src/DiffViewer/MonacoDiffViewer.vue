<template>
  <div
    ref="containerEl"
    class="monaco-editor-container"
    :style="{ width, height }"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'

type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
type ModelOptions = Monaco.editor.ITextModelUpdateOptions

const props = withDefaults(
  defineProps<{
    originalCode?: string
    modifiedCode?: string
    language?: string
    options?: DiffEditorOptions
    modelOptions?: ModelOptions
    width?: string
    height?: string
  }>(),
  {
    originalCode: '',
    modifiedCode: '',
    language: 'plaintext',
    options: () => ({}),
    modelOptions: () => ({}),
    width: '100%',
    height: '400px',
  },
)

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
  (opts) => {
    if (!editor.value) return
    editor.value.updateOptions(opts)
  },
  { deep: true },
)

watch(
  () => props.originalCode,
  (v) => {
    if (!originalModel.value) return
    if (originalModel.value.getValue() !== v) {
      originalModel.value.setValue(v)
    }
  },
)

watch(
  () => props.modifiedCode,
  (v) => {
    if (!modifiedModel.value) return
    if (modifiedModel.value.getValue() !== v) {
      modifiedModel.value.setValue(v)
    }
  },
)

watch(
  () => props.language,
  (lang) => {
    const monaco = monacoInstance.value
    const om = originalModel.value
    const mm = modifiedModel.value
    if (!monaco || !om || !mm) return
    monaco.editor.setModelLanguage(om, lang)
    monaco.editor.setModelLanguage(mm, lang)
  },
)

watch(
  () => props.modelOptions,
  (mo) => {
    if (!originalModel.value || !modifiedModel.value) return
    originalModel.value.updateOptions(mo)
    modifiedModel.value.updateOptions(mo)
  },
  { deep: true },
)
</script>

<style scoped>
.monaco-editor-container {
  min-height: 200px;
}
</style>
