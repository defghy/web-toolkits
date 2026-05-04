import type * as Monaco from 'monaco-editor'

export type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
export type ModelOptions = Monaco.editor.ITextModelUpdateOptions

export interface WtoolDiffViewerProps {
  diffPair?: { filename: string; content: string }[]
  diffPatch?: string
  language?: string
  options?: DiffEditorOptions
  modelOptions?: ModelOptions
  viewerStyle?: WtoolDiffViewerStyle
}

export interface WtoolDiffViewerStyle {
  width?: string
  height?: string
  minHeight?: string
  maxHeight?: string
}
