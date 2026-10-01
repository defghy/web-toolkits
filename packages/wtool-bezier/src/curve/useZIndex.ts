import { onMounted, Ref, ref } from 'vue'
import type Konva from 'konva'
import { useInner } from '../userInner'
import { CurveWidgetType } from '../types'

// 由于konva-vue不支持zIndex，需要自己调用api实现
export const useZIndex = function ({ type, comp }: { type: CurveWidgetType; comp: Ref<any> }) {
  const { funcs } = useInner()

  onMounted(() => {
    const kShape: Konva.Shape = comp.value?.getNode()
    const zIndex = funcs.theme[type]?.zIdx
    if (typeof zIndex === 'number') {
      kShape?.zIndex(zIndex)
    }
  })
}
