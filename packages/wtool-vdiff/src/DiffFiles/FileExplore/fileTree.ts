import { treeUtil, strUtil } from '@yuhufe/web-common'
import type { FileTree } from '../../types'

export interface DiffFileSelection {
  fullPath: string
}

export type FileItem = Pick<FileTree, 'type' | 'fullPath' | 'folderPath' | 'name' | 'diffPair' | 'diffPatch'>

export interface DiffFileTreeNode extends FileTree {
  id: string
  title: string
  children?: DiffFileTreeNode[]
}

function createDirectory(name: string, fullPath: string): DiffFileTreeNode {
  return {
    id: fullPath,
    title: name,
    name,
    fullPath,
    isDirectory: true,
    children: [],
  }
}

function finalizeDirectory(node: DiffFileTreeNode): DiffFileTreeNode {
  const children = node.children?.map(child => (child.isDirectory ? finalizeDirectory(child) : child)) || []
  let directory: DiffFileTreeNode = {
    id: node.id,
    title: node.title,
    name: node.name,
    fullPath: node.fullPath,
    isDirectory: true,
    children,
  }

  while (directory.children?.length === 1 && directory.children[0].isDirectory) {
    const child = directory.children[0]
    const name = `${directory.name}/${child.name}`

    directory = {
      id: child.id,
      title: name,
      name,
      fullPath: child.fullPath,
      isDirectory: true,
      children: child.children,
    }
  }

  return directory
}

// 格式：{ filePath: 'aaa/bbb/ccc', isDirectory: true, children: [] }
export function buildDiffFileTree(files: FileItem[]): DiffFileTreeNode[] {
  const root = createDirectory('', '')

  files.forEach(file => {
    const { fullPath, folderPath = '', name: filename } = file
    const segments = folderPath.split('/').filter(Boolean)
    let parent = root
    let directoryPath = ''

    segments.forEach(segment => {
      directoryPath = directoryPath ? `${directoryPath}/${segment}` : segment
      let directory = parent.children?.find((child: any) => child.isDirectory && child.name === segment)

      if (!directory) {
        directory = createDirectory(segment, directoryPath)
        parent.children?.push(directory)
      }

      parent = directory
    })

    parent.children?.push({
      ...file,
      id: fullPath,
      title: filename || '',
      name: filename,
      fullPath,
      isDirectory: false,
    } as any)
  })

  return root.children!.map(child => (child.isDirectory ? finalizeDirectory(child) : child))
}

export function filterDiffFileTree(fileTree: DiffFileTreeNode[], keyword: string): DiffFileTreeNode[] {
  if (!keyword?.trim()) return fileTree

  const filteredTree = treeUtil.filter(fileTree, node => {
    const hasMatch = [node.title, node.fullPath].find(content => strUtil.like(content, keyword))
    return hasMatch || Boolean(node.children?.length)
  })

  return (filteredTree || []) as DiffFileTreeNode[]
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
