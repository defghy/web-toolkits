import { set, type Ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { usePixEvent } from '@yuhufe/wtool-pixel-core'

import type { PixelLayerData, PixelPaletteInst } from '../../types'
import { useTool, ToolType } from '../usePixelTool'
import { tranversePixel } from '../../utils'

const EMPTY_GRID = { color: 'transparent' }

// 移动工具
export const useMove = function ({
  pixelData,
  comp,
}: {
  pixelData: Ref<PixelLayerData[]>
  comp: Ref<PixelPaletteInst>
}) {
  const { activeTool, toolForm } = useTool()
  const { when } = usePixEvent({ comp })

  when({
    onGridPressed({ evt, r, c, currGrid, passByGrids, layerId }) {
      if (activeTool.value !== ToolType.move) {
        return
      }

      if (passByGrids.length <= 1) {
        startMove({ currGrid, r, c, passByGrids, evt })
      } else {
        moving({ currGrid, r, c, passByGrids, evt, layerId })
      }

      if (evt.type === 'pointerup') {
        endMove()
      }
    },
  })

  let currMoveGrid: { r: number; c: number } | null
  let dataSnapshot: PixelLayerData[] | null

  const startMove = function ({ currGrid, r, c, passByGrids, evt }) {
    if (!dataSnapshot) {
      dataSnapshot = cloneDeep(pixelData.value)
      currMoveGrid = { r, c }
    }
  }

  const moving = function ({ currGrid, r, c, passByGrids, evt, layerId }) {
    // 不重复移动
    if (r === currMoveGrid?.r && c === currMoveGrid?.c) {
      return
    }

    currMoveGrid = { r, c }
    const { r: startR, c: startC } = passByGrids[0]
    const diffR = r - startR
    const diffC = c - startC
    // 移动逻辑
    const originLayer = dataSnapshot?.find(l => l.id === layerId)
    if (!originLayer) {
      return
    }

    const { grids: originGrids } = originLayer

    const height = originGrids.length
    const width = originGrids[0]?.length
    tranversePixel(pixelData.value, ({ grid, rowIdx, colIdx, layerId: targetLayerId }) => {
      if (layerId !== targetLayerId) {
        return
      }

      const needDisable = originGrids[rowIdx][colIdx].disabled
      //禁用格子
      if (needDisable) {
        set(grid, 'disabled', true)
        grid.color = 'transparent'
        return
      }

      //非禁用格子
      const constrastGrid = originGrids?.[rowIdx - diffR]?.[colIdx - diffC] || EMPTY_GRID
      grid.disabled = false
      grid.color = constrastGrid.color
    })
  }

  const endMove = function () {
    currMoveGrid = null
    dataSnapshot = null
  }
}
