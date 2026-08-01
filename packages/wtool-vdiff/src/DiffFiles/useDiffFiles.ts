import { useCompExp } from '@yuhufe/web-ui'
import type { Ref } from 'vue'

import { DiffFile } from '@/types'
import { parsePatchFilenames } from '@/utils/patch'
import type { FileItem } from './types'

export const useDiffFiles = function ({ isMaster = false } = {}) {
  const exp = useCompExp<{
    selectedFileKey: Ref<string>
    searchKeyword: Ref<string>
    selectFile: (fullPath: string) => Promise<void>
    filterTree: (keyword: string) => void
  }>({ isMaster, key: 'diffFiles' })

  return { ...exp }
}

export function formatDiffFiles(diffFiles: DiffFile[]) {
  function resolveDiffFileFullPath(file: DiffFile): string {
    if (file.fullPath) return file.fullPath

    if (file.diffPair) {
      return file.diffPair[1]?.filename || file.diffPair[0]?.filename
    }

    if (typeof file.diffPatch === 'string') {
      return parsePatchFilenames(file.diffPatch).modFilename
    }

    return ''
  }
  const files = diffFiles.map<FileItem>((file, index) => {
    const fullPath = resolveDiffFileFullPath(file)

    const pathSegments = fullPath.split('/')
    const name = pathSegments.at(-1) || ''
    const extname = name.split('.').at(-1)

    return {
      ...file,
      fullPath,
      name,
      folderPath: pathSegments.slice(0, -1).join('/'),
      type: extname?.toLowerCase(),
    }
  })

  files.sort((left, right) => {
    if (left.fullPath === right.fullPath) return 0
    return left.fullPath > right.fullPath ? 1 : -1
  })

  const fileMap: Record<string, FileItem> = Object.fromEntries(files.map(file => [file.fullPath, file]))
  return { files, fileMap }
}
