<template>
  <KGroup ref="kGroupComp">
    <KPath :x="0" :y="0" :config="shadowConfig" />
    <KPath ref="pathRef" :config="config" :x="0" :y="0" />
    <KPath
      :config="touchConfig"
      :x="0"
      :y="0"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
      @click="onClick"
    />
  </KGroup>
</template>

<script lang="ts">
/* 曲线：区分
  - 交互区：区域大，用于选中
  - 线区：区域小，用于展示线
  - 影子区：区域中，用于展示选中
*/
import { PropType, computed, defineComponent, ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import type Konva from 'konva'
import { KonvaComps } from '../common'
import { BezierCurveInfo, CurveWidgetType } from '../types'
import { useInner, useSeg, useSingleCurveInner } from '../userInner'
import { useZIndex } from './useZIndex'

const { KGroup, KPath } = KonvaComps

export default defineComponent({
  name: 'BezierCurve',
  components: { KGroup, KPath },
  props: {
    info: { type: Object as PropType<Required<BezierCurveInfo>>, required: true },
  },
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { funcs: singleFuncs } = useSingleCurveInner()
    const { funcs: segFuncs } = useSeg()

    const printPoint = p => `${p.x} ${p.y}`
    const pathD = computed(() => {
      const { start, end } = props.info
      const { startCtrlPos, endCtrlPos } = segFuncs
      return `M${printPoint(start)} C ${printPoint(startCtrlPos.value)}, ${printPoint(endCtrlPos.value)}, ${printPoint(
        end
      )}`
    })
    const config = computed(() => {
      const { segCurve, grpCurve } = funcs.ueState.value
      const { theme } = singleFuncs

      const style = {
        ...theme.value.curve,
        // 有特殊样式
        ...(grpCurve?.themes[singleFuncs.data.value.id]?.curve || {}),
        ...(segCurve?.themes[props.info.id]?.curve || {}),
      }

      return {
        data: pathD.value,
        ...style,
      }
    })
    const shadowConfig = computed(() => {
      const { segCurve, grpCurve } = funcs.ueState.value
      const style = {
        ...singleFuncs.theme.value.shadowCurve,
        // 有特殊样式
        ...(grpCurve?.themes[singleFuncs.data.value.id]?.shadowCurve || {}),
        ...(segCurve?.themes[props.info.id]?.shadowCurve || {}),
      }

      return {
        data: pathD.value,
        ...style,
      }
    })
    const touchConfig = computed(() => {
      const { strokeWidth } = singleFuncs.theme.value.curve
      return {
        data: pathD.value,
        stroke: 'transparent',
        strokeWidth: strokeWidth * 4,
      }
    })

    // 注册pathFunc方便其他模块儿使用
    const pathRef = ref()
    const getPath = () => {
      return pathRef.value.getNode() as Konva.Path
    }
    onMounted(() => {
      singleFuncs.pathFuncs[props.info.id] = {
        getLength() {
          return getPath()?.getLength()
        },
        getPointAtLength(len) {
          return getPath()?.getPointAtLength(len)
        },
      }
    })
    onBeforeUnmount(() => {
      Reflect.deleteProperty(singleFuncs.pathFuncs, props.info.id)
    })

    function handlePointerEnter(data) {
      funcs.whenCall(funcs.WhenEvent.onSegCurveEnter, {
        segCurveId: props.info.id,
        grpCurveId: singleFuncs.data.value.id,
        singleFuncs,
        funcs,
      })
    }
    function handlePointerLeave() {
      funcs.whenCall(funcs.WhenEvent.onSegCurveLeave, {
        segCurveId: props.info.id,
        grpCurveId: singleFuncs.data.value.id,
        singleFuncs,
        funcs,
      })
    }

    function onClick(evt) {
      evt.cancelBubble = true
      funcs.whenCall(funcs.WhenEvent.onSegCurveClick, {
        curveInfo: props.info,
        index: segFuncs.index.value,
        startCtrlPos: segFuncs.startCtrlPos.value,
        endCtrlPos: segFuncs.endCtrlPos.value,
        singleFuncs,
        funcs,
      })
    }

    // 线层级控制

    const kGroupComp = ref()
    useZIndex({ type: CurveWidgetType.curve, comp: kGroupComp })

    return { config, shadowConfig, touchConfig, pathRef, handlePointerEnter, handlePointerLeave, onClick, kGroupComp }
  },
})
</script>
