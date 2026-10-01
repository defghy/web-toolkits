import VueKonva from 'vue-konva'
import Konva from 'konva'
import { loadKonva, KonvaComps, konvaKit as rawKonvaKit } from '@yuhufe/web-common'

// 注册 konva 组件
loadKonva(VueKonva)

// 以指针位置为中心缩放；@yuhufe/web-common 的 konvaKit 未提供，这里补充
const scaleByPointer = function ({ newScale, node }: { newScale: number; node: Konva.Node }) {
  const stage = node.getStage()
  if (!stage) {
    return
  }

  const pointer = node === stage ? stage.getPointerPosition() : node.getParent()?.getRelativePointerPosition()
  if (!pointer) {
    return
  }

  const oldScale = node.scaleX()
  const mousePointTo = {
    x: (pointer.x - node.x()) / oldScale,
    y: (pointer.y - node.y()) / oldScale,
  }

  node.scale({ x: newScale, y: newScale })
  node.position({
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  })

  return node.position()
}

export const konvaKit = {
  ...rawKonvaKit,
  scaleByPointer,
}

export { KonvaComps, loadKonva, Konva }
