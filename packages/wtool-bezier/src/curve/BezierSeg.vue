<template>
  <div>
    <BezierCurve :info="info" />
    <template v-if="showControlPoints">
      <!-- 控制点/线 -->
      <BezierControl
        :point="info.startCtrl"
        :originPoint="info.start"
        :pointPos="startCtrlPos"
        :peerPoint="curves?.[index - 1]?.endCtrl"
        :colors="{
          point: colors.startCtrlPoint || colors.point,
        }"
        :range="config?.range?.startCtrl"
      />
      <BezierControl
        :point="info.endCtrl"
        :originPoint="info.end"
        :pointPos="endCtrlPos"
        :peerPoint="curves?.[index + 1]?.startCtrl"
        :colors="{
          point: colors.endCtrlPoint || colors.point,
        }"
        :range="config?.range?.endCtrl"
      />
    </template>

    <!-- 端点 -->
    <template v-if="showStart || showEnd">
      <BezierEdPoint v-if="showStart" :point="info.start" :color="isHeadCurve ? colors.headPoint : colors.point" />
      <BezierEdPoint v-if="showEnd" :point="info.end" :color="colors.point" />
    </template>
  </div>
</template>

<script lang="ts">
// 贝塞尔曲线一段
import { PropType, computed, defineComponent, ref, toRef, onBeforeMount, onBeforeUnmount, defineProps } from 'vue'

import { KonvaComps } from '../common'
import { BezierCurveInfo, BezierConfig } from '../types'
import { useInner, useSingleCurveInner } from '../userInner'
import { useSeg } from '../userInner'
import { polar2Rect } from '../utils/utils'
import BezierCurve from './BezierCurve.vue'
import BezierEdPoint from './BezierEdPoint.vue'
import BezierControl from './BezierControl.vue'

const { KGroup, KLine } = KonvaComps

export default defineComponent({
  name: 'BezierSeg',
  components: { KGroup, KLine, BezierCurve, BezierEdPoint, BezierControl },
  props: {
    info: { type: Object as PropType<BezierCurveInfo>, required: true },
    index: { type: Number },
  },
  setup(props, { emit }) {
    const { registerFunc, funcs } = useInner()
    const { funcs: singleFuncs } = useSingleCurveInner()
    const { registerFunc: registerSegFunc } = useSeg({ isMaster: true })
    const { colors } = funcs.theme

    const isHeadCurve = computed(() => props.index === 0)
    const curves = singleFuncs.bezierCurves
    const sw = computed(() => {
      const getBool = val => {
        if (typeof val !== 'function') {
          return !!val
        }

        return val({ index: props.index, info: props.info })
      }
      return Object.fromEntries(
        ['showEdStart', 'showEdEnd', 'showControlPoint'].map(key => {
          const val = singleFuncs.switches.value[key]
          return [key, getBool(val)]
        })
      )
    })

    const isSelected = computed(() => {
      const { grpCurve } = funcs.ueState.value
      return grpCurve?.selected === singleFuncs.data?.value.id
    })

    const showControlPoints = computed(() => isSelected.value && sw.value.showControlPoint)

    const showStart = computed(() => {
      if (!sw.value.showEdStart) return false
      if (!funcs.isLinear.value) return true
      return isHeadCurve.value
    })
    const showEnd = computed(() => sw.value.showEdEnd)

    const startCtrlPos = computed(() => polar2Rect({ ...props.info.startCtrl, originPoint: props.info.start } as any))
    const endCtrlPos = computed(() => {
      const pos = polar2Rect({ ...props.info.endCtrl, originPoint: props.info.end } as any)
      return pos
    })
    registerSegFunc({
      startCtrlPos,
      endCtrlPos,
      index: toRef(props, 'index'),
    })

    onBeforeMount(() => {
      singleFuncs.controlPointMap[props.info.id] = { startCtrlPos, endCtrlPos }
    })
    onBeforeUnmount(() => {
      Reflect.deleteProperty(singleFuncs.controlPointMap, props.info.id)
    })

    const config = funcs.bezierConfig

    return {
      showStart,
      showEnd,
      showControlPoints,
      startCtrlPos,
      endCtrlPos,
      isHeadCurve,
      colors,
      curves,
      isSelected,
      config,
    }
  },
})
</script>
