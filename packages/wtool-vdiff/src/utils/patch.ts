export interface Hunk {
  origStart: number // original 起始行号（1-based）
  origCount: number // original 行数
  modStart: number // modified 起始行号（1-based）
  modCount: number // modified 行数
  lines: string[] // hunk 原始行（含前缀字符）
}

export interface PatchFilenames {
  origFilename: string
  modFilename: string
}

/**
 * 从 unified diff patch 解析 --- / +++ 行中的文件名。
 * 文件名位于 patch 头部，遇到首个 @@ hunk 或已解析到两侧文件名后即停止扫描。
 */
export function parsePatchFilenames(patch: string): PatchFilenames {
  let origFilename = ''
  let modFilename = ''

  let start = 0
  while (start < patch.length) {
    const nl = patch.indexOf('\n', start)
    const line = nl === -1 ? patch.slice(start) : patch.slice(start, nl)
    start = nl === -1 ? patch.length : nl + 1

    if (line.startsWith('--- ')) {
      origFilename = line.slice(4).trim()
      if (origFilename && modFilename) break
      continue
    }
    if (line.startsWith('+++ ')) {
      modFilename = line.slice(4).trim()
      if (origFilename && modFilename) break
      continue
    }
    if (line.startsWith('@@')) break
  }

  return { origFilename, modFilename }
}

/**
 * 从 unified diff patch 解析所有 hunk（@@ 块）
 */
export function parsePatchHunks(patch: string): Hunk[] {
  const lines = patch.split('\n')

  const hunks: Hunk[] = []
  let currentHunk: Hunk | null = null

  for (const line of lines) {
    // @@ -origStart,origCount +modStart,modCount @@
    const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/)
    if (hunkMatch) {
      currentHunk = {
        origStart: parseInt(hunkMatch[1], 10),
        origCount: hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1,
        modStart: parseInt(hunkMatch[3], 10),
        modCount: hunkMatch[4] !== undefined ? parseInt(hunkMatch[4], 10) : 1,
        lines: [],
      }
      hunks.push(currentHunk)
      continue
    }
    if (currentHunk) {
      if (line.startsWith('\\')) continue // "\ No newline at end of file"
      currentHunk.lines.push(line)
    }
  }

  return hunks
}
