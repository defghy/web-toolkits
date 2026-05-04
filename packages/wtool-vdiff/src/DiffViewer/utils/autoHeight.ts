import { WtoolDiffViewerProps } from '@/types'

const LINE_HEIGHT = 18

interface CommonParams {
  minLine: number
  maxLine: number
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}

// 根据pair计算
const autoHeightPatch = function ({
  patch,
  minLine,
  maxLine,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  patch: string
} & CommonParams) {}

// 根据patch计算
const autoHeightPair = function ({
  pair,
  minLine,
  maxLine,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  pair: WtoolDiffViewerProps['diffPair']
} & CommonParams) {}

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
  maxHeight: 'string'
  minHeight: 'string'
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}) {
  const [minLine, maxLine] = [minHeight, maxHeight].map(str => {
    const h = height2Num(str)
    return Math.floor(h / 18)
  })
  const commonParams = {
    minLine,
    maxLine,
    unchangedVisiable,
    unchangedCtxLineNum,
  }

  if (patch) {
    return autoHeightPatch({ patch, ...commonParams })
  }

  return autoHeightPair({ pair, ...commonParams })
}
