import type { WtoolDiffViewerProps } from '@/types'
import { parseHunks } from './patch2Pair'

const LINE_HEIGHT = 18

interface CommonParams {
  minLine: number
  maxLine: number
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}

/**
 * 在线可见行计数器，按顺序逐个喂入变更区间（1-based inclusive），流式累计可见行数。
 * 区间必须按 start 升序喂入，每次 feed 后可读取 visible 判断是否达到 maxLine。
 * @param totalLines 文件总行数，用于 clamp context 窗口上界及判断尾部是否有折叠 widget
 * @param ctx        每个变更块上下保留的 context 行数，对应 Monaco contextLineCount
 * @param maxLine    可见行上限，达到后 maxReached 为 true，调用方应立即停止 feed
 */
function makeVisibleLineCounter(totalLines: number, ctx: number, maxLine: number) {
  let visible = 0       // 已 commit 的确定可见行数（不含当前 pending 块）
  let pendingStart = -1 // 当前待合并窗口的起始行（-1 表示无 pending）
  let pendingEnd = -1   // 当前待合并窗口的结束行

  const commitPending = () => {
    if (pendingStart === -1) return
    if (pendingStart > 1) visible += 1
    visible += pendingEnd - pendingStart + 1
    pendingStart = -1
    pendingEnd = -1
  }

  return {
    feed(s: number, e: number) {
      const winStart = Math.max(1, s - ctx)
      const winEnd = Math.min(totalLines, e + ctx)
      if (pendingEnd === -1 || winStart > pendingEnd + 1) {
        commitPending()          // 新窗口与 pending 有间隙：先提交 pending，再开新窗口
        pendingStart = winStart
        pendingEnd = winEnd
      } else {
        pendingEnd = Math.max(pendingEnd, winEnd) // 新窗口与 pending 重叠：合并，延伸末端
      }
    },
    flush() {
      commitPending()
      if (visible > 0 && pendingEnd !== totalLines) visible += 1
      return Math.min(visible, maxLine)
    },
    get visible() {
      return visible
    },
    get maxReached() {
      return visible >= maxLine
    },
  }
}

const autoHeightPatch = function ({
  patch,
  minLine,
  maxLine,
  unchangedCtxLineNum,
}: {
  patch: string
} & CommonParams): number {
  const { hunks } = parseHunks(patch)
  if (hunks.length === 0) return minLine

  const lastHunk = hunks[hunks.length - 1]
  const totalLines = Math.max(
    lastHunk.origStart + lastHunk.origCount - 1,
    lastHunk.modStart + lastHunk.modCount - 1,
  )
  const counter = makeVisibleLineCounter(totalLines, unchangedCtxLineNum, maxLine)

  for (const h of hunks) {
    const hunkEnd = Math.max(h.origStart + h.origCount - 1, h.modStart + h.modCount - 1)
    counter.feed(h.origStart, hunkEnd)
    if (counter.maxReached) return maxLine
  }

  return Math.max(minLine, counter.flush())
}

const autoHeightPair = function ({
  pair,
  minLine,
  maxLine,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  pair: WtoolDiffViewerProps['diffPair']
} & CommonParams): number {
  if (!pair || pair.length < 2) return minLine

  const origLines = pair[0].content?.split('\n') ?? []
  const modLines = pair[1].content?.split('\n') ?? []
  const totalLines = Math.max(origLines.length, modLines.length)

  if (unchangedVisiable) {
    return Math.max(minLine, Math.min(totalLines, maxLine))
  }

  const counter = makeVisibleLineCounter(totalLines, unchangedCtxLineNum, maxLine)
  let i = 0
  while (i < totalLines) {
    if ((origLines[i] ?? '') !== (modLines[i] ?? '')) {
      const start = i + 1
      while (i < totalLines && (origLines[i] ?? '') !== (modLines[i] ?? '')) i++
      counter.feed(start, i)
      if (counter.maxReached) return maxLine
    } else {
      i++
    }
  }

  return Math.max(minLine, counter.flush())
}

const height2Num = (heightStr: string): number => {
  if (heightStr.endsWith('vh')) {
    const vh = parseFloat(heightStr)
    return Math.round((vh / 100) * document.documentElement.clientHeight)
  }
  return Math.round(parseFloat(heightStr))
}

export const autoHeight = function ({
  patch,
  pair,
  maxHeight,
  minHeight,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  patch?: string
  pair?: WtoolDiffViewerProps['diffPair']
  maxHeight: string
  minHeight: string
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}): number {
  const [minLine, maxLine] = [minHeight, maxHeight].map(str => Math.floor(height2Num(str) / LINE_HEIGHT))
  const commonParams: CommonParams = { minLine, maxLine, unchangedVisiable, unchangedCtxLineNum }

  if (patch) return autoHeightPatch({ patch, ...commonParams }) * LINE_HEIGHT
  return autoHeightPair({ pair, ...commonParams }) * LINE_HEIGHT
}
