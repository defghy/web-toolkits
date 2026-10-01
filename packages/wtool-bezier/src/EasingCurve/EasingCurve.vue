<template>
  <div class="easing-curve-wrapper" ref="wrapperRef" @contextmenu.prevent>
    <KStage v-if="stageConfig.width" :config="stageConfig" ref="stageRef">
      <KLayer>
        <EasingBaseLine :curve="baseLineCurve" />
        <BezierCurveSingle :data="singleCurveData" :index="0" @change="onChangeSingle" />
      </KLayer>
    </KStage>
  </div>
</template>

<script lang="ts">
// 缓动曲线编辑器
import { PropType, toRef, defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { merge, cloneDeep, debounce } from 'lodash-es'

import { KonvaComps, useCompatModel } from '../common'
import { Point } from '../types'
import { BezierCurveModel, BezierCurveSingle as BezierCurveSingleModel, FlagPoint } from '../types'
import { useInnerMaster, useWhen, useSyncModel } from '../userInner'
import { makeTheme } from '../userInner/useTheme'
import { useEditMode } from '../userInner/useCurveMode'
import { useEasingCurve } from './useEasingCurve'
import EasingBaseLine from './EasingBaseLine.vue'
import BezierCurveSingle from '../curve/BezierCurveSingle.vue'
import './mode'
import { easingCurveMode } from './mode'
import { PluginFlagPoint } from '../curve/BezierFlagPoint'

const { KStage, KLayer } = KonvaComps

export default defineComponent({
  name: 'EasingCurve',
  components: { KStage, KLayer, EasingBaseLine, BezierCurveSingle },
  props: {
    // 接收 笛卡尔坐标
    modelValue: { type: Object as PropType<{ easingData: BezierCurveModel[]; flagPoints: FlagPoint[] }> },
  },
  emits: ['change'],
  model: useCompatModel.model,
  setup(props, { emit }) {
    const stageRef = ref()
    const { modelChange } = useCompatModel(emit)
    const { registerFunc, funcs, screen2Cartesian, cartesian2Screen } = useInnerMaster({
      stageRef,
    })
    registerFunc({
      plugins: [{ registerMode: easingCurveMode }, PluginFlagPoint], // 缓动没有动画，支持标记点
    })
    const { pointTrans, SideLength } = useEasingCurve()
    const { when, WhenEvent, whenUnbind } = useWhen({ getFuncs: () => funcs })
    registerFunc({
      when,
      whenUnbind,
      WhenEvent,
    })
    const { currEditMode, toggleMode, ueState, getMode } = useEditMode({ funcs })

    const easingCurveId = crypto.randomUUID()

    // 转换为单曲线组件使用的屏幕坐标
    const formatSingleData = function (): BezierCurveSingleModel {
      // 转换为屏幕坐标 => 坐标放大
      const transformPos = function (point: Point) {
        const screenPoint = cartesian2Screen({ origin: { x: 0, y: 1 }, cartesPoint: point })
        return pointTrans.deNormalize(screenPoint)
      }

      const { easingData, flagPoints } = props.modelValue
      const curveSegs = easingData.map(curve => {
        let { start, end, startCtrl, endCtrl } = curve
        // 坐标转换
        ;[start, end, startCtrl, endCtrl] = [start, end, startCtrl, endCtrl].map(point => {
          return transformPos(point)
        })
        return { ...curve, start, end, startCtrl, endCtrl }
      })

      return {
        id: easingCurveId,
        curveSegs,
        flagPoints: flagPoints.map(flagPoint => {
          return {
            ...flagPoint,
            point: transformPos(flagPoint.point),
          }
        }),
        switches: {
          showEdStart: ({ index }) => index !== 0,
          showEdEnd: ({ index }) => index !== singleCurveData.value.curveSegs.length - 1,
          showControlPoint: true,
          canSelect: true,
          canDelete: false,
        },
      }
    }

    const singleCurveData = ref(formatSingleData())
    function onChangeSingle(single: BezierCurveSingleModel) {
      singleCurveData.value = single

      const transformPos = function (point: Point) {
        const screenPoint = pointTrans.normalize(point)
        return screen2Cartesian({ origin: { x: 0, y: 1 }, screenPoint })
      }
      const curves = single.curveSegs.map(curve => {
        let { start, end, startCtrl, endCtrl } = curve
        ;[start, end, startCtrl, endCtrl] = [start, end, startCtrl, endCtrl].map(point => {
          return transformPos(point)
        })
        return { ...curve, start, end, startCtrl, endCtrl }
      })
      const flagPoints = single.flagPoints.map(flagPoint => {
        return { ...flagPoint, point: transformPos(flagPoint.point) }
      })
      modelChange({ easingData: curves, flagPoints })
      afterChange()
    }

    // 容器layout
    const wrapperRef = ref<HTMLElement>()
    const stageConfig = ref<any>({ width: 0, height: 0 })
    const freshLayout = () => {
      const rect = wrapperRef.value?.getBoundingClientRect()
      if (rect?.width) {
        const scale = +(rect.width / (SideLength + 20)).toFixed(2)
        stageConfig.value = {
          width: rect.width,
          height: rect.height,
          scale: { x: scale, y: scale },
          position: { x: 12 * scale, y: 8 * scale },
        }
      }
    }
    let observer: ResizeObserver
    onMounted(() => {
      freshLayout()
      observer = new ResizeObserver(onResize)
      observer.observe(wrapperRef.value)
    })
    onBeforeUnmount(() => {
      observer?.disconnect()
    })
    const onResize = debounce(() => {
      freshLayout()
    }, 500)

    const easingTheme = merge(
      makeTheme({
        pointSize: 2.4,
        curve: {
          strokeWidth: 1,
        },
        controlLine: {
          strokeWidth: 0.5,
          dash: [4, 2],
        },
        colors: {
          startCtrlPoint: '#E86AA9',
          endCtrlPoint: '#02B1C7',
        },
      }),
      {
        spec: {
          hovered: {
            shadowCurve: {
              shadowOpacity: 0,
              strokeWidth: 0,
            },
          },
          selected: {
            shadowCurve: {
              shadowOpacity: 0, // 只有1条线，不需要选中
              strokeWidth: 0,
            },
          },
          remove: {},
          add: {},
        },
      }
    )
    ueState.value.grpCurve.selected = easingCurveId

    const curveRange = {
      x: { min: 0, max: SideLength },
      y: { min: 0, max: SideLength },
    }
    registerFunc({
      isLinear: ref(true),
      theme: easingTheme,
      currEditMode,
      ueState,
      getMode,
      singleFuncsMap: {},
      bezierConfig: {
        range: {
          startCtrl: curveRange,
          endCtrl: curveRange,
        },
      },
      flagProgressType: 'y',
    })

    const baseLineCurve = computed(() => ({
      start: { x: 0, y: SideLength },
      end: { x: SideLength, y: 0 },
    }))

    const updateView = () => {
      singleCurveData.value = formatSingleData()
    }
    const { afterChange } = useSyncModel({
      modelValue: toRef(props, 'modelValue'),
      updateView,
    })

    return {
      wrapperRef,
      stageConfig,
      singleCurveData,
      baseLineCurve,
      stageRef,
      funcs,
      updateView,
      toggleMode,
      currEditMode,
      onChangeSingle,
    }
  },
})
</script>

<style lang="less">
.easing-curve-wrapper {
  width: 100%;
  height: 100%;
}
</style>
