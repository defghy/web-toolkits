export interface FilePair {
  filename: string
  content: string
}

export interface Hunk {
  origStart: number  // original 起始行号（1-based）
  origCount: number  // original 行数
  modStart: number   // modified 起始行号（1-based）
  modCount: number   // modified 行数
  lines: string[]    // hunk 原始行（含前缀字符）
}

/**
 * 解析 unified diff patch，提取文件名与所有 hunk
 */
export function parseHunks(patch: string): { origFilename: string; modFilename: string; hunks: Hunk[] } {
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
 * 策略：
 *   - hunk 之外的行（patch 未提供内容）：两侧各补一个空行撑开行号，
 *     Monaco hideUnchangedRegions 会将这些相同的空行折叠并显示正确的行号范围
 *   - context 行（' '）：两侧均写入真实内容
 *   - 连续的删除（'-'）/ 新增（'+'）块：收集后成对对齐写入，
 *     行数较少的一侧补空行，使 Monaco 能在同一视觉行渲染替换关系
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

  const pendingDel: string[] = []
  const pendingAdd: string[] = []

  const flushPending = () => {
    const maxLen = Math.max(pendingDel.length, pendingAdd.length)
    for (let i = 0; i < maxLen; i++) {
      origLines.push(pendingDel[i] ?? '')
      modLines.push(pendingAdd[i] ?? '')
    }
    pendingDel.length = 0
    pendingAdd.length = 0
  }

  let origCursor = 1
  let modCursor = 1

  for (const hunk of hunks) {
    // hunk 之前（或两个 hunk 之间）的 gap：两侧各补空行对齐行号
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
        flushPending()
        origLines.push(content)
        modLines.push(content)
        origCursor++
        modCursor++
      } else if (prefix === '-') {
        pendingDel.push(content)
        origCursor++
      } else if (prefix === '+') {
        pendingAdd.push(content)
        modCursor++
      }
    }

    flushPending()
  }

  return [
    { filename: origFilename, content: origLines.join('\n') },
    { filename: modFilename, content: modLines.join('\n') },
  ]
}
