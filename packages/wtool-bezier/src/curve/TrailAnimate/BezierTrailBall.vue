<template>
  <KCircle ref="ballRef" :config="config" :radius="6" :fill="'#c41d7f'" />
</template>

<script lang="ts">
// 沿着多个curve运动的点
import { PropType, computed, defineComponent, onBeforeMount, onBeforeUnmount, ref, toRef } from 'vue'
import { KonvaComps } from '../../common'
import { Point, BezierCurveInfo, BezierCurveSingle } from '../../types'
import { useInner, useSingleCurveInner, useWhen } from '../../userInner'
import { useTrial, EasingType } from './useTrial'

const { KGroup, KCircle, KLine } = KonvaComps

export default defineComponent({
  name: 'BezierTrialBall',
  components: { KGroup, KCircle, KLine },
  props: {
    curves: { type: Array as PropType<BezierCurveInfo[]>, required: true },
    data: { type: Object as PropType<BezierCurveSingle> },
  },
  setup(props, { emit }) {
    const { registerFunc, funcs } = useInner()
    const { funcs: singleFuncs } = useSingleCurveInner()
    const { WhenEvent } = funcs
    const showBall = ref(false)
    const ballRef = ref()
    const isCycle = computed(() => singleFuncs.data.value.trail?.cycle)

    let hideTimeout: any
    let lastTravelParams: { randomStart?: number; randomDisturb?: number } = {}
    const { startTravel, pauseTravel, resumeTravel, stopTravel } = useTrial({
      curves: toRef(props, 'curves'),
      easing: computed(() => props.data.easingData),
      getBall: () => ballRef.value?.getNode(),
      onTravelStart() {
        clearTimeout(hideTimeout)
        showBall.value = true
      },
      // 运动完消失
      onTravelEnd({ manual }: any = {}) {
        // 手动停止，立即隐藏
        if (manual) {
          showBall.value = false
          return
        }

        // 动画结束停止
        hideTimeout = setTimeout(() => {
          showBall.value = false
        }, 1000)
        // 循环播放，1次播放结束直接开始下一次
        if (isCycle.value) {
          clearTimeout(hideTimeout)
          setTimeout(() => travel[WhenEvent.travelStart](lastTravelParams), 500)
        }
      },
    })

    const travelFactory = function (func) {
      return (params?: { randomStart?: number; randomDisturb?: number }) => {
        const { trail } = singleFuncs.data.value
        if (!trail.enable) {
          return
        }
        func(params)
      }
    }
    const travel = {
      [WhenEvent.travelStart]: travelFactory((params?: { randomStart?: number; randomDisturb?: number }) => {
        lastTravelParams = params || {}
        startTravel(params)
      }),
      [WhenEvent.travelPause]: travelFactory(pauseTravel),
      [WhenEvent.travelResume]: travelFactory(resumeTravel),
      [WhenEvent.travelStop]: travelFactory(() => {
        stopTravel({ manual: true })
      }),
    }

    // 控制点配置
    const config = computed(() => {
      return {
        visible: showBall.value,
        stroke: '#ffffb8',
        strokeWidth: 1,
        shadowColor: '#ffffb8', // 阴影颜色
        shadowBlur: 6, // 模糊半径
        shadowOpacity: 1, // 阴影透明度
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      }
    })

    onBeforeMount(() => {
      funcs.when({
        ...travel,
      })
    })
    onBeforeUnmount(() => {
      funcs.whenUnbind({
        ...travel,
      })
    })

    return {
      config,
      showBall,
      ballRef,
    }
  },
})
</script>
