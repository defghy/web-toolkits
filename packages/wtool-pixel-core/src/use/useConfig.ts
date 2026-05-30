// 记录全局配置
import { reactive, toRefs, provide, Ref, computed } from 'vue'
import { merge, isEmpty, cloneDeep } from 'lodash-es'
import { DeepPartial } from '../types'
import type { InnerFunc } from './useInner'

const defaultConfig = {
  grid: { size: 20, render: null as null | Function },
  border: {
    size: 1,
    color: '#595959',
    groupColor: '#bfbfbf',
  },
  board: { backLayerRender: null as null | Function, foreLayerRender: null as null | Function },
  groupInfo: { row: 0, col: 0 },
  rowNum: 0,
  colNum: 0,
}

export type PixelCommonConfig = typeof defaultConfig

// 用于组件内部使用
export const useConfigMaster = function ({ exp }: { exp: InnerFunc }) {
  const { registerFunc, funcs } = exp

  const pixelConfig = reactive(cloneDeep(defaultConfig))

  // 整个棋盘的rect宽高
  const boardRect = computed(() => {
    const { colNum, rowNum, grid, border } = pixelConfig
    return {
      width: colNum * grid.size + (colNum + 1) * border.size,
      height: rowNum * grid.size + (rowNum + 1) * border.size,
    }
  })

  const setConfig = function (cfg: DeepPartial<PixelCommonConfig>) {
    merge(pixelConfig, cfg)
  }

  const config = {
    ...toRefs(pixelConfig),
    boardRect,
  }
  registerFunc({
    config,
    setConfig,
  })

  return { config, setConfig }
}

export type UsePixelConfig = ReturnType<typeof useConfigMaster>
