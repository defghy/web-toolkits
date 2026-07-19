import { treeUtil } from '@yuhufe/web-common'
import type { FileTree } from '../types'
import type { FileItem } from './types'

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
    const path = node.name || node.fullPath
    if (node.children) {
      paths.push(path)
    } else {
      const filename = path || ''
      const extname = filename.split('.').at(-1)
      const fullPath = [...paths, filename].join('/')
      const fullPaths = fullPath.split('/')
      files.push({
        ...node,
        name: fullPaths.at(-1),
        fullPath,
        folderPath: fullPaths.slice(0, -1).join('/'),
        type: extname?.toLowerCase(),
      })
    }
  })

  files.sort((left, right) => (left.fullPath > right.fullPath ? 1 : -1))
  const fileMap = Object.fromEntries(files.map(file => [file.filePath, file]))
  return { files, fileMap }
}
