import { treeUtil } from '@yuhufe/web-common'
import type { FileTree } from '../../types'

export interface DiffFileSelection {
  diffFile: FileTree
  path: string
  sourceIndex: number
}

export interface FileItem {
  filePath: string
  name?: string
  file: FileTree
  diffPatch?: string
  diffPair?: FileTree['diffPair']
}

export interface FileTreePathItem {
  fullPath: string
  node: FileTree
}

export interface FileMapNode {
  name: string
  fullPath: string
  files: FlatFileTreeItem[]
  children: Record<string, FileMapNode>
}

interface BaseFileTreeNode {
  id: string
  title: string
  fullPath: string
  kind: 'directory' | 'file'
}

export interface DirectoryTreeNode extends BaseFileTreeNode {
  kind: 'directory'
  children: FileTreeNode[]
}

export interface DiffFileTreeNode extends BaseFileTreeNode {
  kind: 'file'
  sourceIndex: number
  diffFile: FileTree
}

export type FileTreeNode = DirectoryTreeNode | DiffFileTreeNode

function normalizePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .split('/')
    .filter(segment => segment !== '' && segment !== '.')
    .join('/')
}

function splitFilePath(filePath: string): {
  filePath: string
  foldPath: string
  name: string
} {
  const normalizedPath = normalizePath(filePath)
  const segments = normalizedPath.split('/')
  const name = segments.pop() || normalizedPath

  return {
    filePath: normalizedPath,
    foldPath: segments.join('/'),
    name,
  }
}

/**
 * Directory nodes only contribute path context. File nodes are collected with
 * their resolved full path.
 */
export function collectFileTreePaths(fileTree: FileTree[]): FileTreePathItem[] {
  const paths: FileTreePathItem[] = []
  const fullPathMap = new WeakMap<FileTree, string>()

  treeUtil.tranverse(fileTree, (node, { parent }: { parent: FileTree | null }) => {
    const nodePath = normalizePath(node.filePath)
    const parentPath = parent ? fullPathMap.get(parent) || '' : ''
    const fullPath =
      parentPath && nodePath !== parentPath && !nodePath.startsWith(`${parentPath}/`)
        ? `${parentPath}/${nodePath}`
        : nodePath

    fullPathMap.set(node, fullPath)

    if (node.isDirector || node.children?.length) return

    paths.push({ fullPath, node })
    return false
  })

  return paths
}

function createFileMapNode(name: string, fullPath: string): FileMapNode {
  return {
    name,
    fullPath,
    files: [],
    children: Object.create(null) as Record<string, FileMapNode>,
  }
}

/**
 * Groups the flat file list into a folder map. Each folder owns its direct
 * files and child folders, so parent/child insertion order does not matter.
 */
export function buildFileMap(files: FileItem[]): FileMapNode {
  const root = createFileMapNode('', '')

  files.forEach(file => {
    const folderSegments = file.foldPath ? file.foldPath.split('/') : []
    let parent = root
    let currentPath = ''

    folderSegments.forEach(segment => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      parent.children[segment] ||= createFileMapNode(segment, currentPath)
      parent = parent.children[segment]
    })

    parent.files.push(file)
  })

  return root
}

function compareText(left: string, right: string): number {
  const leftFolded = left.toLocaleLowerCase('en-US')
  const rightFolded = right.toLocaleLowerCase('en-US')

  if (leftFolded < rightFolded) return -1
  if (leftFolded > rightFolded) return 1
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function compareNodes(left: FileTreeNode, right: FileTreeNode): number {
  if (left.kind !== right.kind) return left.kind === 'directory' ? -1 : 1

  const labelOrder = compareText(left.title, right.title)
  if (labelOrder) return labelOrder

  const pathOrder = compareText(left.fullPath, right.fullPath)
  if (pathOrder) return pathOrder

  if (left.kind === 'file' && right.kind === 'file') {
    return left.sourceIndex - right.sourceIndex
  }

  return 0
}

function fileMapDirectoryToTree(node: FileMapNode): DirectoryTreeNode {
  const directories = Object.values(node.children).map(fileMapDirectoryToTree)
  const files: DiffFileTreeNode[] = node.files.map(file => ({
    id: `file:${file.sourceIndex}:${file.filePath}`,
    title: file.name,
    fullPath: file.filePath,
    kind: 'file',
    sourceIndex: file.sourceIndex,
    diffFile: file.file,
  }))

  let directory: DirectoryTreeNode = {
    id: `directory:${node.fullPath}`,
    title: node.name,
    fullPath: node.fullPath,
    kind: 'directory',
    children: [...directories, ...files].sort(compareNodes),
  }

  while (directory.children.length === 1 && directory.children[0].kind === 'directory') {
    const child = directory.children[0]
    directory = {
      id: child.id,
      title: `${directory.title}/${child.title}`,
      fullPath: child.fullPath,
      kind: 'directory',
      children: child.children,
    }
  }

  return directory
}

export function fileMapToTree(fileMap: FileMapNode): FileTreeNode[] {
  const directories = Object.values(fileMap.children).map(fileMapDirectoryToTree)
  const files: DiffFileTreeNode[] = fileMap.files.map(file => ({
    id: `file:${file.sourceIndex}:${file.filePath}`,
    title: file.name,
    fullPath: file.filePath,
    kind: 'file',
    sourceIndex: file.sourceIndex,
    diffFile: file.file,
  }))

  return [...directories, ...files].sort(compareNodes)
}

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
