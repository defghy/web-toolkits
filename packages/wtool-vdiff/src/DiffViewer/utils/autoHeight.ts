import { diffLines } from 'diff'
import type { WtoolDiffViewerProps } from '@/types'
import { parsePatchHunks } from '@/utils/patch'

const LINE_HEIGHT = 18
const GAP_HEIGHT = 24
const heightMap = new Map<string, Partial<Record<'visible' | 'hidden', number>>>()

interface CommonParams {
  minPx: number
  maxPx: number
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}

interface ChangedLineBlock {
  start: number
  end: number
}

interface ChangedLineInfo {
  blocks: ChangedLineBlock[]
  totalLines: number
}

function getChangedLineInfo(origContent: string, modContent: string): ChangedLineInfo {
  const changes = diffLines(origContent, modContent)
  const blocks: ChangedLineBlock[] = []
  let row = 1
  let removed = 0
  let added = 0

  const flush = () => {
    const len = Math.max(removed, added)
    if (len > 0) {
      blocks.push({ start: row, end: row + len - 1 })
      row += len
      removed = 0
      added = 0
    }
  }

  for (const part of changes) {
    const count = part.count ?? 0

    if (part.removed) {
      removed += count
    } else if (part.added) {
      added += count
    } else {
      flush()
      row += count
    }
  }

  flush()

  return {
    blocks,
    totalLines: Math.max(0, row - 1),
  }
}

/**
 * 在线可见行计数器，按顺序逐个喂入变更区间（1-based inclusive），流式累计可见行数。
 * 区间必须按 start 升序喂入，每次 feed 后可读取 maxReached 判断是否达到像素上限。
 * @param totalLines 文件总行数，用于 clamp context 窗口上界及判断尾部是否有折叠 widget
 * @param ctx        每个变更块上下保留的 context 行数，对应 Monaco contextLineCount
 * @param maxPx      像素上限，达到后 maxReached 为 true，调用方应立即停止 feed
 */
function makeVisibleLineCounter(totalLines: number, ctx: number, maxPx: number) {
  let visible = 0 // 已 commit 的确定可见行数（不含当前 pending 块）
  let gaps = 0 // gap widget 数量（每个折叠区域占 GAP_HEIGHT，非 LINE_HEIGHT）
  let pendingStart = -1 // 当前待合并窗口的起始行（-1 表示无 pending）
  let pendingEnd = -1 // 当前待合并窗口的结束行

  const usedPx = () => visible * LINE_HEIGHT + gaps * GAP_HEIGHT

  const commitPending = () => {
    if (pendingStart === -1) return
    if (pendingStart > 1) gaps += 1
    visible += pendingEnd - pendingStart + 1
    pendingStart = -1
    pendingEnd = -1
  }

  return {
    feed(s: number, e: number) {
      const winStart = Math.max(1, s - ctx)
      const winEnd = Math.min(totalLines, e + ctx)
      if (pendingEnd === -1 || winStart > pendingEnd + 1) {
        commitPending() // 新窗口与 pending 有间隙：先提交 pending，再开新窗口
        pendingStart = winStart
        pendingEnd = winEnd
      } else {
        pendingEnd = Math.max(pendingEnd, winEnd) // 新窗口与 pending 重叠：合并，延伸末端
      }
    },
    flush() {
      const lastEnd = pendingEnd
      commitPending()
      if (visible > 0 && lastEnd !== totalLines) gaps += 1
      return usedPx()
    },
    get usedPx() {
      return usedPx()
    },
    get gaps() {
      return gaps
    },
    get maxReached() {
      return usedPx() >= maxPx
    },
  }
}

const autoHeightPatch = function ({
  patch,
  minPx,
  maxPx,
  unchangedCtxLineNum,
}: {
  patch: string
} & CommonParams): number {
  const hunks = parsePatchHunks(patch)
  if (hunks.length === 0) return minPx

  const lastHunk = hunks[hunks.length - 1]
  const totalLines = Math.max(lastHunk.origStart + lastHunk.origCount - 1, lastHunk.modStart + lastHunk.modCount - 1)
  const counter = makeVisibleLineCounter(totalLines, unchangedCtxLineNum, maxPx)

  for (const h of hunks) {
    const hunkEnd = Math.max(h.origStart + h.origCount - 1, h.modStart + h.modCount - 1)
    counter.feed(h.origStart, hunkEnd)
    if (counter.maxReached) return maxPx
  }

  return Math.max(minPx, counter.flush())
}

const autoHeightPair = function ({
  pair,
  minPx,
  maxPx,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  pair: WtoolDiffViewerProps['diffPair']
} & CommonParams): number {
  if (!pair || pair.length < 2) return minPx

  const origContent = pair[0].content ?? ''
  const modContent = pair[1].content ?? ''
  const origLines = origContent.split('\n')
  const modLines = modContent.split('\n')
  const totalLines = Math.max(origLines.length, modLines.length)

  if (unchangedVisiable) {
    return Math.max(minPx, Math.min(totalLines * LINE_HEIGHT, maxPx))
  }

  const { blocks, totalLines: diffTotalLines } = getChangedLineInfo(origContent, modContent)
  if (blocks.length === 0) return minPx

  const counter = makeVisibleLineCounter(diffTotalLines, unchangedCtxLineNum, maxPx)
  for (const block of blocks) {
    counter.feed(block.start, block.end)
    if (counter.maxReached) return maxPx
  }

  let result = counter.flush()
  result = Math.max(minPx, result)
  result = Math.min(maxPx, result)

  return result
}

const height2Num = (heightStr: string): number => {
  if (heightStr.endsWith('vh')) {
    const vh = parseFloat(heightStr)
    return Math.round((vh / 100) * document.documentElement.clientHeight)
  }
  return Math.round(parseFloat(heightStr))
}

export const autoHeight = function ({
  id,
  patch,
  pair,
  maxHeight,
  minHeight,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  id: string
  patch?: string
  pair?: WtoolDiffViewerProps['diffPair']
  maxHeight: string
  minHeight: string
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}): number {
  const cacheKey = unchangedVisiable ? 'visible' : 'hidden'
  const cache = heightMap.get(id) || {}
  const cachedHeight = cache?.[cacheKey]
  if (cachedHeight !== undefined) return cachedHeight

  const [minPx, maxPx] = [minHeight, maxHeight].map(height2Num)
  const commonParams: CommonParams = { minPx, maxPx, unchangedVisiable, unchangedCtxLineNum }
  const height = patch ? autoHeightPatch({ patch, ...commonParams }) : autoHeightPair({ pair, ...commonParams })

  heightMap.set(id, {
    ...cache,
    [cacheKey]: height,
  })

  return height
}
