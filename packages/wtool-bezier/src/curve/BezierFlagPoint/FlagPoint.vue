<template>
  <KGroup>
    <KRegularPolygon
      :config="hitConfig"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @click="onClick"
      :draggable="true"
      @dragmove="dragMove"
    />
    <KRegularPolygon :config="flagConfig" />
  </KGroup>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue'
import { KonvaComps } from '../../common'

import { FlagPoint } from '../../types'
import { flagPointColors } from './const'
import { useInner, useSingleCurveInner } from '../../userInner'

const { KGroup, KRegularPolygon } = KonvaComps

export default defineComponent({
  name: 'FlagPoint',
  components: { KGroup, KRegularPolygon },
  props: {
    flagPoint: { type: Object as PropType<FlagPoint>, required: true },
    index: Number,
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { funcs: singleFuncs } = useSingleCurveInner()
    const isHovered = ref(false)
    // 正三角形高度为外接圆半径的 1.5 倍
    const radius = computed(() => singleFuncs.theme.value.pointSize * 0.8)
    const color = computed(() => {
      return flagPointColors[props.index % flagPointColors.length]
    })
    const isExtreme = computed(() => props.flagPoint.type === 'extreme')

    const flagConfig = computed(() => {
      const { spec, point } = funcs.theme
      return {
        x: props.flagPoint.point.x,
        y: props.flagPoint.point.y,
        sides: 3,
        radius: radius.value,
        fill: isExtreme.value ? '#fff' : color.value,
        stroke: isExtreme.value ? '#000' : isHovered.value ? spec.hovered.point.stroke : point.stroke,
        strokeWidth: isHovered.value ? spec.hovered.point.strokeWidth : point.strokeWidth,
        listening: false,
      }
    })
    const hitConfig = computed(() => ({
      x: props.flagPoint.point.x,
      y: props.flagPoint.point.y,
      sides: 3,
      radius: radius.value * 1.6,
      fill: '#fff',
      opacity: 0,
    }))

    const onPointerEnter = function () {
      funcs.updateCursor('pointer')
      isHovered.value = true
    }
    const onPointerLeave = function () {
      funcs.updateCursor('')
      isHovered.value = false
    }
    const onClick = function (event) {
      event.cancelBubble = true
      funcs.whenCall(funcs.WhenEvent.onFlagPointClick, {
        flagPoint: props.flagPoint,
        event,
        singleFuncs,
        funcs,
      })
    }

    function dragMove({ evt, target }) {
      const { progressType } = props.flagPoint
      const { dim, utils } = singleFuncs.calcFuncs.value
      const { point: nearPoint } = utils.getNearByPos({ pos: funcs.getStage()?.getRelativePointerPosition() })
      const newProgress = dim[progressType].point2Percent(nearPoint)

      // 更新数据
      const newFlagPoint = { ...props.flagPoint, point: nearPoint, progress: newProgress }
      const newFlagPoints = singleFuncs.data.value.flagPoints.map(flagPoint => {
        if (flagPoint.key === newFlagPoint.key) {
          return newFlagPoint
        }
        return flagPoint
      })
      singleFuncs.updateData({
        flagPoints: newFlagPoints,
      })
    }

    return {
      flagConfig,
      hitConfig,
      onPointerEnter,
      onPointerLeave,
      onClick,
      dragMove,
    }
  },
})
</script>
