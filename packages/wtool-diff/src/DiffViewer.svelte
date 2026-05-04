<script lang="ts">
  import type * as Monaco from 'monaco-editor'
  import MonacoEditor from './MonacoEditor.svelte'

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
</script>

<div class="diff-view-wrap">
  <div class="title-bar">
    
  </div>
  <MonacoEditor
    {originalCode}
    {modifiedCode}
    {language}
    {options}
    {modelOptions}
    {width}
    {height}
  />
</div>

<style>
  .diff-view-wrap {
    display: flex;
    flex-direction: column;


  }
</style>
