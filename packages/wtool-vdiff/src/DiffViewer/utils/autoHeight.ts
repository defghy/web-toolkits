import { WtoolDiffViewerProps } from '@/types'

interface CommonParams {
  maxHeight: number
  minHeight: number
  unchangedVisiable: boolean
  unchangedCtxLineNum: number
}

// 根据pair计算
const autoHeightPatch = function ({
  patch,
  minHeight,
  maxHeight,
  unchangedVisiable,
  unchangedCtxLineNum,
}: {
  patch: string
} & CommonParams) {}

// 根据patch计算
const autoHeightPair = function ({
  pair,
  minHeight,
  maxHeight,
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
  const [minH, maxH] = [minHeight, maxHeight].map(str => height2Num(str))
  const commonParams = {
    minHeight: minH,
    maxHeight: maxH,
    unchangedVisiable,
    unchangedCtxLineNum,
  }

  if (patch) {
    return autoHeightPatch({ patch, ...commonParams })
  }

  return autoHeightPair({ pair, ...commonParams })
}
