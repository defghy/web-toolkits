import type { DiffFile } from '../types'

// 文件列表的每个文件类型
export interface FileItem extends DiffFile {
  fullPath: string
  name: string
  folderPath: string
  type?: string
}

export interface DiffFileState {
  height: number
  viewed: boolean
  isRaw: boolean
}
