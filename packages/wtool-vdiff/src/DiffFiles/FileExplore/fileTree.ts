import { treeUtil } from '@yuhufe/web-common'
import type { FileTree } from '../../types'

export interface DiffFileSelection {
  diffFile: FileTree
  path: string
  sourceIndex: number
}

type FileItem = Pick<FileTree, 'type' | 'filePath' | 'name' | 'diffPair' | 'diffPatch'>

// 格式：{ filePath: 'aaa/bbb/ccc', isDirectory: true, children: [] }
export function buildDiffFileTree(files: FileItem[]): FileTree[] {
  return []
}

/**
 * FileTree can be a nested directory tree or an already flattened file list.
 * Directory entries are discarded and every file leaf keeps its full filePath.
 */
export function fileTree2FileList(fileTree: FileTree[]): {
  files: FileItem[]
  fileMap: Record<string, FileItem>
} {
  const files: any[] = []

  treeUtil.tranverse(fileTree, function (node, args) {
    const { paths = [] } = args
    // 文件夹
    if (node.children) {
      paths.push(node.name || node.filePath)
    } else {
      const filename = node.name || node.filePath || ''
      const extname = filename.split('.').at(-1)
      files.push({
        ...node,
        filePath: [...paths, filename].join('/'),
        type: extname?.toLowerCase(),
      })
    }
  })

  const fileMap = Object.fromEntries(files.map(file => [file.filePath, file]))
  return { files, fileMap }
}
