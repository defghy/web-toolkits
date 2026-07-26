import type * as Monaco from 'monaco-editor'

export type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
export type ModelOptions = Monaco.editor.ITextModelUpdateOptions

export interface WtoolDiffViewerProps {
  fileId?: string
  diffPair?: { filename: string; content: string | null }[]
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

export interface DiffFile {
  fullPath?: string
  diffPair?: WtoolDiffViewerProps['diffPair']
  diffPatch?: string
  viewerStyle?: WtoolDiffViewerStyle
}

/** @deprecated Use DiffFile. Nested directory input is no longer supported. */
export type FileTree = DiffFile

export interface WtoolDiffFilesProps {
  diffFiles?: DiffFile[]
  viewerStyle?: WtoolDiffViewerStyle
}
