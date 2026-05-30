import { parsePatchFilenames, parsePatchHunks } from '@/utils/patch'

export interface FilePair {
  filename: string
  content: string
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

  const { origFilename, modFilename } = parsePatchFilenames(patch)
  const hunks = parsePatchHunks(patch)

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
