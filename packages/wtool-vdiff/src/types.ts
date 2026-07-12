import type * as Monaco from 'monaco-editor'

export type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
export type ModelOptions = Monaco.editor.ITextModelUpdateOptions

export interface WtoolDiffViewerProps {
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

interface FileItem {
  filePath: string
  name?: string
  type?: string
}
export interface FileTree extends FileItem {
  diffPair?: WtoolDiffViewerProps['diffPair']
  diffPatch?: string

  // 文件夹
  isDirectory?: boolean
  children?: FileTree[]
}
