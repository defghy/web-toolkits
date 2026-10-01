<template>
  <div>
    <KLine ref="kLineComp" :config="lineConfig" :lineJoin="'round'" :lineCap="'round'" />
    <UEPointArea
      :pos="config"
      @pointerenter="onPointerEnter"
      @pointerleave="onPointerLeave"
      @dragmove="dragMove"
      @pointerdown="onClick"
    >
      <KCircle :config="config" :radius="radius" :stroke="'#fffb8f'" />
    </UEPointArea>
  </div>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { PropType, computed, defineComponent, onMounted, ref, toRef } from 'vue'
import { merge } from 'lodash-es'
import type Konva from 'konva'

import { KonvaComps } from '../common'
import { Point, ControlPoint, PointRange, CurveWidgetType } from '../types'
import { useInner, useSeg, useSingleCurveInner } from '../userInner'
import { coordUtil } from '../utils/utils'
import UEPointArea from '../components/UEPointArea.vue'
import { useZIndex } from './useZIndex'

const { KGroup, KCircle, KLine } = KonvaComps

export default defineComponent({
  name: 'BezierControl',
  components: { KGroup, KCircle, KLine, UEPointArea },
  props: {
    point: { type: Object as PropType<ControlPoint>, required: true },
    peerPoint: { type: Object as PropType<ControlPoint> }, // 和当前控制点成对儿的控制点
    pointPos: { type: Object as PropType<Point>, required: true },
    originPoint: { type: Object as PropType<Point>, required: true },
    colors: { type: Object as PropType<{ point: string }> },
    range: { type: Object as PropType<PointRange> },
  },
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { funcs: singleFuncs } = useSingleCurveInner()
    const { funcs: segFuncs } = useSeg()
    const radius = funcs.theme.pointSize / 2

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

    // 控制点配置
    const config = computed(() => {
      const { spec, point } = funcs.theme
      return {
        strokeWidth: isHover.value ? spec.hovered.point.strokeWidth : point.strokeWidth,
        x: props.pointPos.x,
        y: props.pointPos.y,
        fill: props.colors.point,
      }
    })

    // 控制线配置
    const lineConfig = computed(() => {
      const { originPoint, pointPos } = props
      const { controlLine } = funcs.theme
      return {
        points: [originPoint.x, originPoint.y, pointPos.x, pointPos.y],
        ...controlLine,
      }
    })

    // 拖拽控制点
    const ranges = computed(() => {
      const { x, y } = (props.range || {}) as PointRange

      const makeRange = r => merge({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }, r || {})
      const xRange = makeRange(x)
      const yRange = makeRange(y)

      return {
        adjustX(curr: number) {
          curr = Math.min(xRange.max, curr)
          curr = Math.max(xRange.min, curr)
          return curr
        },
        adjustY(curr: number) {
          curr = Math.min(yRange.max, curr)
          curr = Math.max(yRange.min, curr)
          return curr
        },
      }
    })
    function dragMove({ evt, target }) {
      const { adjustX, adjustY } = ranges.value
      const targetPos = {
        x: target.x(),
        y: target.y(),
      }
      targetPos.x = adjustX(targetPos.x)
      targetPos.y = adjustY(targetPos.y)
      target.x(targetPos.x)
      target.y(targetPos.y)
      const { magnitude, angle } = coordUtil.rect2Polar({ origin: props.originPoint, target: targetPos })
      singleFuncs.updateCurve(props.point, { magnitude, angle })

      if (funcs.isLinear.value && props.peerPoint) {
        singleFuncs.updateCurve(props.peerPoint, {
          ...props.peerPoint,
          angle: coordUtil.normalizeAngle(angle + Math.PI),
        })
      }
    }

    function onClick({ evt }) {
      funcs.whenCall(funcs.WhenEvent.onControlPointClick, {
        point: props.point,
        originPoint: props.originPoint,
        index: segFuncs.index.value,
        singleFuncs,
        funcs,
      })
    }

    const kLineComp = ref()
    useZIndex({ type: CurveWidgetType.controlLine, comp: kLineComp })

    return {
      onPointerEnter,
      onPointerLeave,
      isHover,
      config,
      radius,
      lineConfig,
      dragMove,
      onClick,
      kLineComp,
    }
  },
})
</script>
