<template>
  <KGroup :config="singleConfig">
    <KGroup>
      <!-- 为了兼容zIndex, 所有元素在一层 -->
      <BezierSeg v-for="(curve, index) in bezierCurves" :key="curve.id" :info="curve" :index="index" />
    </KGroup>
    <components
      v-for="(comp, compIndex) in pluginComps"
      :key="comp.name || compIndex"
      :is="comp"
      :data="data"
      :curves="bezierCurves"
    />
  </KGroup>
</template>

<script lang="ts">
// 一条曲线，由曲线片段和可选动画小球组成
import { PropType, computed, defineComponent, ref, onBeforeMount, toRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { merge, cloneDeep, debounce } from 'lodash-es'
import { useCompatModel, KonvaComps } from '../common'

import { useSingleTheme, useCurveCRUD, useSyncModel, useCurveListCalc } from '../userInner'
import { rect2Polar, createCurveInfo } from '../utils/utils'
import { BezierConfig, BezierCurveSingle } from '../types'
import BezierSeg from './BezierSeg.vue'
import { useInner, useSingleCurveInner } from '../userInner'

const { KStage, KLayer, KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'BezierCurveSingle',
  components: {
    KStage,
    KLayer,
    KGroup,
    KRect,
    BezierSeg,
  },
  props: {
    data: { type: Object as PropType<BezierCurveSingle> },
    index: Number,
  },
  emits: ['change', 'delete'],
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { funcs: singleFuncs, registerFunc: singleRegister } = useSingleCurveInner({ isMaster: true })

    onBeforeMount(() => {
      funcs.singleFuncsMap[props.data.id] = singleFuncs
    })
    onBeforeUnmount(() => {
      Reflect.deleteProperty(funcs.singleFuncsMap, props.data.id)
    })

    // 可渲染曲线数据
    const formatModel = function () {
      const { curveSegs } = props.data
      return curveSegs.map((curr, index) => {
        let start = curr.start
        if (funcs.isLinear.value && index > 0) {
          start = curveSegs[index - 1].end // 连续曲线，前一个曲线的终点是后一个曲线的起点
        }

        return createCurveInfo({
          ...curr,
          start,
          // 控制点转换为极坐标
          startCtrl: { ...rect2Polar({ origin: curr.start, target: curr.startCtrl }) },
          endCtrl: { ...rect2Polar({ origin: curr.end, target: curr.endCtrl }) },
        })
      })
    }

    // 数据 && 更新
    const bezierCurves = ref(formatModel())

    function freshModel() {
      // 触发modelValue修改
      const curveSegs = bezierCurves.value.map(curve => {
        const pos = singleFuncs.controlPointMap[curve.id]
        return {
          ...curve,
          startCtrl: pos.startCtrlPos.value,
          endCtrl: pos.endCtrlPos.value,
        }
      })
      emit('change', {
        ...props.data,
        curveSegs,
      })

      // 拟合线修改，控制点也会变更。此时需要外部修改数据
      if (!props.data.owner) {
        afterChange()
      }
    }
    async function updateCurve(target, value) {
      if (typeof target === 'function') {
        target()
      } else {
        Object.assign(target, value)
      }

      await nextTick()

      // 如果所有曲线段都被删除，通知父级移除自身
      if (bezierCurves.value.length === 0) {
        emit('delete', props.data.id)
        return
      }

      freshModel()

      funcs.whenCall(funcs.WhenEvent.onCurveUpdated, {
        singleFuncs,
        funcs,
      })
    }
    // 更新其他数据
    function updateData(data) {
      emit('change', {
        ...props.data,
        ...data,
      })
    }

    const singleConfig = computed(() => {
      return {
        visible: !props.data.hide,
      }
    })

    const dataRef = toRef(props, 'data')
    const { singleTheme } = useSingleTheme({ data: dataRef, index: toRef(props, 'index') })

    const defaultSwitches = {
      showEdStart: true,
      showEdEnd: true,
      showControlPoint: true,
      canSelect: true,
      canDelete: false,
    }
    const switches = computed(() => ({
      ...defaultSwitches,
      ...(props.data.switches || {}),
    }))

    const { calcFuncs } = useCurveListCalc({ curves: bezierCurves })
    singleRegister({
      bezierCurves,
      updateCurve,
      updateData,
      theme: singleTheme,
      data: dataRef,
      switches,
      calcFuncs,
    })

    // 需要updateData
    const curveCRUD = useCurveCRUD({ curves: bezierCurves, funcs, singleFuncs })
    singleRegister({
      crud: { ...curveCRUD } as any,
    })

    const { afterChange } = useSyncModel({
      modelValue: dataRef,
      updateView() {
        bezierCurves.value = formatModel()
      },
    })

    const pluginComps = computed(() => {
      return funcs.plugins.map(plugin => plugin.components?.inCurve).filter(Boolean)
    })

    return {
      bezierCurves,
      singleConfig,
      singleFuncs,
      pluginComps,
    }
  },
})
</script>

<style scoped>
.bezier-palette {
  width: 100%;
  height: 100%;
  background-color: #434343;
}
</style>
