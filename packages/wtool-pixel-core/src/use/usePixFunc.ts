import { Ref, onMounted, shallowRef, nextTick } from 'vue'
import type Konva from 'konva'

import { konvaKit } from '@yuhufe/web-common'
import { InnerFunc } from './useInner'
import type { PixelPaletteInst } from '../types'

// 用于组件内部使用
export const usePixFuncMaster = function ({ exp }: { exp: InnerFunc }) {
  const { registerFunc, funcs } = exp

  // 将棋盘重置到容器中间，缩放到合适大小
  const centerAndPosition = async function () {
    const { rowNum, colNum, grid, border } = funcs.config
    const stage = funcs.getStage()
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    const { size: gsize } = grid.value
    const { size: bsize } = border.value
    const bwidth = (gsize + bsize) * colNum.value + bsize
    const bheight = (gsize + bsize) * rowNum.value + bsize
    const stageWidth = stage.width()
    const stageHeight = stage.height()
    const padding = { x: 100, y: 100 }
    const ratio = +Math.min((stageWidth - padding.x) / bwidth, (stage.height() - padding.y) / bheight).toFixed(1)
    stage.scale({ x: ratio, y: ratio })

    stage.position({
      x: Math.round(Math.abs(stageWidth - bwidth * ratio) / 2),
      y: Math.round(Math.abs(stageHeight - bheight * ratio) / 2),
    })
  }

  registerFunc({
    centerAndPosition,
  })
}

export const usePixFunc = function ({ comp }: { comp?: Ref<PixelPaletteInst> } = {}) {
  let innerStage: Ref<Konva.Stage | null> = shallowRef(null)
  const getStage = function () {
    if (innerStage.value) {
      return innerStage.value
    }
    const stage = comp?.value?.funcs.getStage()
    if (!stage) {
      throw new Error('PixelPalette instance is not ready')
    }
    innerStage.value = stage
    return innerStage.value
  }
  const getHistoryDo = () => comp?.value?.historyDo

  // 将棋盘重置到容器中间，缩放到合适大小
  const centerAndPosition = async function () {
    return comp?.value?.funcs.centerAndPosition()
  }
  const scaleByCenter = function ({ newScale }: { newScale: number }) {
    const stage = getStage()
    return konvaKit.scaleByPoint({ x: stage.width() / 2, y: stage.height() / 2, newScale, node: stage })
  }
  const positionByDelta = function ({ deltaX = 0, deltaY = 0 }) {
    const stage = getStage()
    const { x, y } = stage.position()
    stage.position({ x: x + deltaX, y: y + deltaY })
  }

  // 当前棋盘导出图片，参数 https://konvajs.org/api/Konva.Layer.html#toDataURL__anchor
  const exportImage = async function (...args) {
    // 渲染完成
    await comp?.value?.funcs.isRenderred()
    const stage = getStage()
    const area = stage.find('#pixelBoardArea')[0]

    return area.toDataURL(...args)
  }

  return {
    getStage,
    getHistoryDo,
    stage: innerStage,
    centerAndPosition,
    scaleByCenter,
    positionByDelta,
    exportImage,
  }
}
