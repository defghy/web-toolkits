interface FilePair {
  filename: string
  content: string
}

interface Hunk {
  origStart: number  // original 起始行号（1-based）
  origCount: number  // original 行数
  modStart: number   // modified 起始行号（1-based）
  modCount: number   // modified 行数
  lines: string[]    // hunk 原始行（含前缀字符）
}

/**
 * 解析 unified diff patch，提取文件名与所有 hunk
 */
function parseHunks(patch: string): { origFilename: string; modFilename: string; hunks: Hunk[] } {
  const lines = patch.split('\n')

  let origFilename = ''
  let modFilename = ''
  const hunks: Hunk[] = []
  let currentHunk: Hunk | null = null

  for (const line of lines) {
    if (line.startsWith('--- ')) {
      origFilename = line.slice(4).trim()
      continue
    }
    if (line.startsWith('+++ ')) {
      modFilename = line.slice(4).trim()
      continue
    }
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

  return { origFilename, modFilename, hunks }
}

/**
 * 将 unified diff patch 转换为 [original, modified] 文件对。
 *
 * Monaco diff editor 需要两个完整文件内容，而 patch 只记录变更片段。
 * 未改动的行（hunk 之外）用空行填充，使两侧行号与 hunk 声明的起始位置对齐，
 * 从而让 Monaco 能在正确的行号位置渲染增删差异。
 */
export const patch2Pair = function (patch: string): FilePair[] {
  if (!patch) {
    return [
      { filename: '', content: '' },
      { filename: '', content: '' },
    ]
  }

  const { origFilename, modFilename, hunks } = parseHunks(patch)

  const origLines: string[] = []
  const modLines: string[] = []

  // 追踪两侧各自已写到的行号（1-based）
  let origCursor = 1
  let modCursor = 1

  for (const hunk of hunks) {
    // hunk 之前未覆盖的行用空行填充，使光标推进到 hunk 起始位置
    while (origCursor < hunk.origStart) {
      origLines.push('')
      origCursor++
    }
    while (modCursor < hunk.modStart) {
      modLines.push('')
      modCursor++
    }

    for (const line of hunk.lines) {
      const prefix = line[0]
      const content = line.slice(1)

      if (prefix === ' ') {
        // context 行：两侧都保留原文
        origLines.push(content)
        modLines.push(content)
        origCursor++
        modCursor++
      } else if (prefix === '-') {
        // 删除行：original 保留，modified 用空行占位
        origLines.push(content)
        modLines.push('')
        origCursor++
        modCursor++
      } else if (prefix === '+') {
        // 新增行：modified 保留，original 用空行占位
        origLines.push('')
        modLines.push(content)
        origCursor++
        modCursor++
      }
    }
  }

  return [
    { filename: origFilename, content: origLines.join('\n') },
    { filename: modFilename, content: modLines.join('\n') },
  ]
}
