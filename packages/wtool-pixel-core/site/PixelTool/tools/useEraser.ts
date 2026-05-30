import type { Ref } from 'vue'
import { usePixEvent } from '@yuhufe/wtool-pixel-core'

import type { PixelLayerData, PixelPaletteInst } from '../../types'
import { useTool, ToolType } from '../usePixelTool'

// 画笔工具
export const useEraser = function ({
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
      if (activeTool.value !== ToolType.eraser) {
        return
      }

      currGrid.color = 'transparent'
    },
  })
}
