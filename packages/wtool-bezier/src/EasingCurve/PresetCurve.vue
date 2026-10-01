<template>
  <svg width="100" height="100" viewBox="0 0 100 100">
    <path :d="pathD" stroke="white" fill="none" stroke-width="4" />
  </svg>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, ref, onMounted, onUnmounted } from 'vue'
import type Konva from 'konva'
import { merge, cloneDeep } from 'lodash-es'

import { KonvaComps, useCompatModel } from '../common'
import { BezierCurveInfo } from '../types'
import { coordUtil } from '../utils'
import { useEasingCurve } from './useEasingCurve'

const { KStage, KLayer } = KonvaComps

export default defineComponent({
  name: 'EasingPresetCurve',
  components: {},
  props: {
    // 接收 笛卡尔坐标
    curveInfo: { type: Object as PropType<Pick<BezierCurveInfo, 'startCtrl' | 'endCtrl'>> },
  },
  model: useCompatModel.model,
  setup(props, { emit }) {
    const { pointTrans } = useEasingCurve()
    const pathD = computed(() => {
      const [startCtrlPoint, endCtrlPoint] = [props.curveInfo.startCtrl, props.curveInfo.endCtrl].map(point => {
        const screenCtrlPoint = coordUtil.cartesian2Screen({
          origin: { x: 0, y: 1 },
          cartesPoint: point as any,
        })
        return pointTrans.deNormalize(screenCtrlPoint)
      })
      return `M 0 100 C ${startCtrlPoint.x} ${startCtrlPoint.y}, ${endCtrlPoint.x} ${endCtrlPoint.y}, 100 0`
    })

    return { pathD }
  },
})
</script>

<style lang="less"></style>
