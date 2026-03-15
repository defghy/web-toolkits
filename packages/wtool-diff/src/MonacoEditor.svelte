<script lang="ts">
  import { onMount } from 'svelte'
  import loader from '@monaco-editor/loader'
  import type * as Monaco from 'monaco-editor'

  type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
  type ModelOptions = Monaco.editor.ITextModelUpdateOptions

  let {
    originalCode = '',
    modifiedCode = '',
    language = 'plaintext',
    options = {},
    modelOptions = {},
    width = '100%',
    height = '400px',
  }: {
    originalCode?: string
    modifiedCode?: string
    language?: string
    options?: DiffEditorOptions
    modelOptions?: ModelOptions
    width?: string
    height?: string
  } = $props()

  let containerEl = $state<HTMLDivElement | undefined>(undefined)
  let monacoInstance: typeof Monaco | null = null
  let editor: Monaco.editor.IStandaloneDiffEditor | null = null
  let originalModel: Monaco.editor.ITextModel | null = null
  let modifiedModel: Monaco.editor.ITextModel | null = null

  onMount(() => {
    let disposed = false

    const init = async () => {
      const monaco = await loader.init()
      if (disposed || !containerEl) return

      monacoInstance = monaco
      originalModel = monaco.editor.createModel(originalCode, language)
      modifiedModel = monaco.editor.createModel(modifiedCode, language)

      editor = monaco.editor.createDiffEditor(containerEl, {
        automaticLayout: true, // 容器尺寸变化时自动重新布局
        readOnly: true, // 只读，不可编辑
        renderSideBySide: true, // 双栏diff
        useInlineViewWhenSpaceIsLimited: false, // 空间不足也不切内联 diff
        scrollBeyondLastLine: false, // 禁止滚动到最后一行之后
        hideUnchangedRegions: { 
          enabled: true, // 折叠未改动区域
          contextLineCount: 3 // 上下文行数
        },
        ...options,
      })
      editor.setModel({
        original: originalModel,
        modified: modifiedModel,
      })

      if (Object.keys(modelOptions).length > 0) {
        originalModel.updateOptions(modelOptions)
        modifiedModel.updateOptions(modelOptions)
      }
    }

    void init()

    return () => {
      disposed = true
      editor?.dispose()
      originalModel?.dispose()
      modifiedModel?.dispose()
    }
  })

  $effect(() => {
    if (!editor) return
    editor.updateOptions(options)
  })

  $effect(() => {
    if (!originalModel) return
    if (originalModel.getValue() !== originalCode) {
      originalModel.setValue(originalCode)
    }
  })

  $effect(() => {
    if (!modifiedModel) return
    if (modifiedModel.getValue() !== modifiedCode) {
      modifiedModel.setValue(modifiedCode)
    }
  })

  $effect(() => {
    if (!monacoInstance || !originalModel || !modifiedModel) return
    monacoInstance.editor.setModelLanguage(originalModel, language)
    monacoInstance.editor.setModelLanguage(modifiedModel, language)
  })

  $effect(() => {
    if (!originalModel || !modifiedModel) return
    originalModel.updateOptions(modelOptions)
    modifiedModel.updateOptions(modelOptions)
  })
</script>

<div bind:this={containerEl} class="monaco-editor-container" style:width style:height></div>

<style>
  .monaco-editor-container {
    min-height: 200px;
  }
</style>
