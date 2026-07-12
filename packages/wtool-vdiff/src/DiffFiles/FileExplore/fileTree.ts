import type { WtoolDiffViewerProps } from '../../types'
import { parsePatchFilenames } from '../../utils/patch'

export interface DiffFileSelection {
  diffFile: WtoolDiffViewerProps
  path: string
  sourceIndex: number
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
  diffFile: WtoolDiffViewerProps
}

export type FileTreeNode = DirectoryTreeNode | DiffFileTreeNode

interface MutableDirectoryNode extends DirectoryTreeNode {
  directoryChildren: Map<string, MutableDirectoryNode>
  fileChildren: DiffFileTreeNode[]
}

function normalizedCandidate(path: string | undefined): string {
  if (!path || !path.trim()) return ''

  return path
    .replace(/\\/g, '/')
    .split('/')
    .filter(segment => segment !== '' && segment !== '.')
    .join('/')
}

export function normalizeDiffPath(path: string | undefined, sourceIndex: number): string {
  return normalizedCandidate(path) || `untitled-${sourceIndex + 1}`
}

export function resolveDiffPath(diffFile: WtoolDiffViewerProps, sourceIndex: number): string {
  const candidates = [
    diffFile.filePath,
    diffFile.diffPair?.[1]?.filename,
    diffFile.diffPair?.[0]?.filename,
  ]

  if (diffFile.diffPatch) {
    const { modFilename, origFilename } = parsePatchFilenames(diffFile.diffPatch)
    candidates.push(modFilename, origFilename)
  }

  for (const candidate of candidates) {
    const normalizedPath = normalizedCandidate(candidate)
    if (normalizedPath) return normalizedPath
  }

  return normalizeDiffPath(undefined, sourceIndex)
}

function createDirectory(title: string, fullPath: string): MutableDirectoryNode {
  return {
    id: `directory:${fullPath}`,
    title,
    fullPath,
    kind: 'directory',
    children: [],
    directoryChildren: new Map(),
    fileChildren: [],
  }
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

function finalizeDirectory(node: MutableDirectoryNode): DirectoryTreeNode {
  const directoryChildren = [...node.directoryChildren.values()].map(finalizeDirectory)
  let finalized: DirectoryTreeNode = {
    id: node.id,
    title: node.title,
    fullPath: node.fullPath,
    kind: 'directory',
    children: [...directoryChildren, ...node.fileChildren].sort(compareNodes),
  }

  while (
    finalized.children.length === 1 &&
    finalized.children[0].kind === 'directory'
  ) {
    const child = finalized.children[0]
    finalized = {
      id: child.id,
      title: `${finalized.title}/${child.title}`,
      fullPath: child.fullPath,
      kind: 'directory',
      children: child.children,
    }
  }

  return finalized
}

export function buildDiffFileTree(diffFiles: WtoolDiffViewerProps[]): FileTreeNode[] {
  const root = createDirectory('', '')

  diffFiles.forEach((diffFile, sourceIndex) => {
    const fullPath = resolveDiffPath(diffFile, sourceIndex)
    const segments = fullPath.split('/')
    const filename = segments.pop()!
    let parent = root
    let directoryPath = ''

    for (const segment of segments) {
      directoryPath = directoryPath ? `${directoryPath}/${segment}` : segment
      let directory = parent.directoryChildren.get(segment)

      if (!directory) {
        directory = createDirectory(segment, directoryPath)
        parent.directoryChildren.set(segment, directory)
      }

      parent = directory
    }

    parent.fileChildren.push({
      id: `file:${sourceIndex}:${fullPath}`,
      title: filename,
      fullPath,
      kind: 'file',
      sourceIndex,
      diffFile,
    })
  })

  const directories = [...root.directoryChildren.values()].map(finalizeDirectory)
  return [...directories, ...root.fileChildren].sort(compareNodes)
}
