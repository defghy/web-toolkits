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
  fullPath: string // 文件全路径
  folderPath?: string // 文件夹路径
  type?: string
}
export interface FileTree extends FileItem {
  diffPair?: WtoolDiffViewerProps['diffPair']
  diffPatch?: string
  name?: string // 文件名，文件夹名

  // 文件夹
  isDirectory?: boolean
  children?: FileTree[]
}
