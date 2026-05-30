import { Ref } from 'vue'
import { usePixEvent } from '@yuhufe/wtool-pixel-core'

import type { PixelGridData, PixelLayerData, PixelPaletteInst } from '../../types'
import { useTool, ToolType } from '../usePixelTool'

export const useBucket = function ({
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
      if (activeTool.value !== ToolType.paintBucket) {
        return
      }
      if (evt.type !== 'pointerup') {
        return
      }

      const grids = pixelData.value.find(item => item.id == layerId)?.grids || []
      if (!grids.length) return

      const { color } = currGrid
      const relatedGrids = getRelatedGrids({
        grid: currGrid,
        grids,
        rowIdx: r,
        colIdx: c,
        relatedFunc: ({ grid }) => {
          return color === grid.color
        },
      })
      relatedGrids.forEach(relatedGrid => {
        const { grid } = relatedGrid
        grid.color = toolForm.value.color
      })
    },
  })
}

//返回当前格子的所有关联格子数组
const getRelatedGrids = ({ grid, grids, relatedFunc, rowIdx, colIdx }) => {
  const visited = {}
  const relatedGrids: { rowIdx: number; colIdx: number; grid: PixelGridData }[] = []
  const dfs = ({ grid, x, y }) => {
    if (!grid) return
    // 禁用格子不处理
    if (grid.disabled) return
    if (visited[`${x}_${y}`]) return
    if (!relatedFunc({ grid })) return
    visited[`${x}_${y}`] = true
    relatedGrids.push({ grid, rowIdx: x, colIdx: y })
    ;[
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ].forEach(dir => {
      const nextx = x + dir[0]
      const nexty = y + dir[1]
      const nextPixel = grids?.[nextx]?.[nexty]
      dfs({
        grid: nextPixel,
        x: nextx,
        y: nexty,
      })
    })
  }
  dfs({ grid, x: rowIdx, y: colIdx })
  return relatedGrids
}
