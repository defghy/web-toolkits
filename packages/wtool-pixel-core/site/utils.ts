import type { PixelGridData, PixelLayerData } from './types'

export const tranversePixel = function (
  data: PixelLayerData[],
  callback: (args: { grid: PixelGridData; rowIdx: number; colIdx: number; layerId: string }) => any
) {
  data.forEach((layer, layerIdx) => {
    layer.grids.forEach((rowGrids, rowIdx) => {
      rowGrids.forEach((grid, colIdx) => {
        callback({ grid, rowIdx, colIdx, layerId: layer.id })
      })
    })
  })
}
