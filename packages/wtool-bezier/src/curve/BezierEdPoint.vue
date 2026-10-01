<template>
  <UEPointArea
    :pos="point"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @dragmove="dragPoint"
    @pointerdown="onClick"
  >
    <KRect :config="rectConfig" :width="pointSize" :height="pointSize" />
  </UEPointArea>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { PropType, computed, defineComponent, ref, inject } from 'vue'
import { KonvaComps } from '../common'
import { useInner, useSeg, useSingleCurveInner } from '../userInner'
import UEPointArea from '../components/UEPointArea.vue'
import { Point } from '../types'

const { KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'BezierEdPoint',
  components: { KGroup, KRect, UEPointArea },
  props: {
    point: { type: Object as PropType<Point>, required: true },
    color: String,
  },
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { funcs: singleFuncs } = useSingleCurveInner()
    const { funcs: segFuncs } = useSeg()
    const { pointSize, colors } = funcs.theme

    // 移入时高亮
    const isHover = ref(false)
    const onPointerEnter = function (evt: PointerEvent) {
      funcs.updateCursor('pointer')
      isHover.value = true
    }
    const onPointerLeave = function (evt: PointerEvent) {
      funcs.updateCursor('')
      isHover.value = false
    }

    const rectConfig = computed(() => {
      const { x, y } = props.point
      const { spec, point } = funcs.theme
      return {
        x: x - pointSize / 2,
        y: y - pointSize / 2,
        fill: props.color,
        strokeWidth: isHover.value ? spec.hovered.point.strokeWidth : point.strokeWidth,
        stroke: '#fffb8f',
        draggable: true,
      }
    })

    // 拖拽控制点
    function dragPoint({ evt, target }) {
      singleFuncs.updateCurve(props.point, { x: target.x(), y: target.y() })
    }

    function onClick({ evt }) {
      funcs.whenCall(funcs.WhenEvent.onEdPointClick, {
        point: props.point,
        index: segFuncs.index.value,
        singleFuncs,
        funcs,
      })
    }

    return {
      onPointerEnter,
      onPointerLeave,
      isHover,
      rectConfig,
      pointSize,
      dragPoint,
      onClick,
    }
  },
})
</script>
