import type { FileTree } from '../types'

// 文件列表的每个文件类型
export type FileItem = Omit<FileTree, 'isDirectory' | 'children'>

export interface DiffFileState {
  height: number | string
  viewed: boolean
  isRaw: boolean
}
