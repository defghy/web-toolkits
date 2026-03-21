import type * as Monaco from 'monaco-editor'

export type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
export type ModelOptions = Monaco.editor.ITextModelUpdateOptions

export interface WtoolMonacoDiffProps {
  originalCode?: string
  modifiedCode?: string
  language?: string
  options?: DiffEditorOptions
  modelOptions?: ModelOptions
  width?: string
  height?: string
}

export interface WtoolDiffViewerProps {
  diffPair?: { filename: string; content: string }[]
  diffPatch?: string
  language?: string
  options?: DiffEditorOptions
  modelOptions?: ModelOptions
  width?: string
  height?: string
}
