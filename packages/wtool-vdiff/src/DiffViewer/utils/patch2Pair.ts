import { parsePatchFilenames, parsePatchHunks } from '@/utils/patch'

export interface FilePair {
  filename: string
  content: string | null
}

export interface PatchChangedLineBlock {
  start: number
  end: number
}

export interface PatchPairLayout {
  pair: FilePair[]
  changedLineBlocks: PatchChangedLineBlock[]
  totalLines: number
}

/**
 * 将 unified diff patch 转换为 [original, modified] 文件对。
 *
 * 策略：
 *   - hunk 之外的行（patch 未提供内容）：两侧各补一个空行撑开行号，
 *     Monaco hideUnchangedRegions 会将这些相同的空行折叠并显示正确的行号范围
 *   - context 行（' '）：两侧均写入真实内容
 *   - 连续的删除（'-'）/ 新增（'+'）块：分别写入对应侧，
 *     由 Monaco 自己为纯新增、纯删除和不等长替换生成视觉占位
 */
export const patch2PairWithLayout = function (patch: string): PatchPairLayout {
  if (!patch) {
    return {
      pair: [
        { filename: '', content: '' },
        { filename: '', content: '' },
      ],
      changedLineBlocks: [],
      totalLines: 1,
    }
  }

  const { origFilename, modFilename } = parsePatchFilenames(patch)
  const hunks = parsePatchHunks(patch)

  const origLines: string[] = []
  const modLines: string[] = []
  const changedLineBlocks: PatchChangedLineBlock[] = []

  const pendingDel: string[] = []
  const pendingAdd: string[] = []
  let layoutLineCount = 0

  const flushPending = () => {
    const maxLen = Math.max(pendingDel.length, pendingAdd.length)
    if (maxLen > 0) {
      const start = layoutLineCount + 1
      changedLineBlocks.push({ start, end: start + maxLen - 1 })
      layoutLineCount += maxLen
    }
    origLines.push(...pendingDel)
    modLines.push(...pendingAdd)
    pendingDel.length = 0
    pendingAdd.length = 0
  }

  let origCursor = 1
  let modCursor = 1

  for (const hunk of hunks) {
    // hunk 之前（或两个 hunk 之间）的 gap：两侧各补空行对齐行号
    const origGap = hunk.origStart - origCursor
    const modGap = hunk.modStart - modCursor
    while (origCursor < hunk.origStart) {
      origLines.push('')
      origCursor++
    }
    while (modCursor < hunk.modStart) {
      modLines.push('')
      modCursor++
    }
    layoutLineCount += Math.max(0, origGap, modGap)

    for (const line of hunk.lines) {
      const prefix = line[0]
      const content = line.slice(1)

      if (prefix === ' ') {
        flushPending()
        origLines.push(content)
        modLines.push(content)
        origCursor++
        modCursor++
        layoutLineCount++
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

  const originalContent = origLines.length === 0 && modLines.length > 0 ? null : origLines.join('\n')
  const modifiedContent = modLines.length === 0 && origLines.length > 0 ? null : modLines.join('\n')

  return {
    pair: [
      { filename: origFilename, content: originalContent },
      { filename: modFilename, content: modifiedContent },
    ],
    changedLineBlocks,
    totalLines: layoutLineCount,
  }
}

export const patch2Pair = function (patch: string): FilePair[] {
  return patch2PairWithLayout(patch).pair
}
