<template>
  <div class="bezier-palette" ref="wrapperRef" @contextmenu.prevent>
    <KStage v-if="stageConfig.width" :config="stageConfig" ref="stageRef">
      <BezierBackLayer :info="backImgInfo" :comps="comps" />
      <KLayer>
        <component
          v-if="comps?.aboveBack"
          :is="comps.aboveBack"
          :back-info="backImgInfo"
          v-bind="comps.aboveBackProps"
        />
        <BezierCurveSingleComp
          v-for="(single, index) in modelValue"
          :key="single.id"
          :data="single"
          :index="index"
          @change="onChangeSingle"
          @delete="onDeleteSingle"
        />
      </KLayer>
    </KStage>
  </div>
</template>

<script lang="ts">
// 完整画板
import { PropType, computed, defineComponent, ref, onMounted, toRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { merge, cloneDeep, debounce } from 'lodash-es'
import { useCompatModel, KonvaComps, useKonvaScale, useKonvaTranslate, konvaKit } from './common'
import { useInnerMaster, BezierTheme, useCenterAndFitImg, useWhen, useSyncModel } from './userInner'
import { makeTheme } from './userInner/useTheme'
import { useEditMode } from './userInner/useCurveMode'
import { BezierCurveSingle, BezierPlugin } from './types'
import BezierBackLayer from './BezierBackLayer.vue'
import BezierCurveSingleComp from './curve/BezierCurveSingle.vue'
import { PluginFlagPoint } from './curve/BezierFlagPoint'
import { PluginTravel } from './curve/TrailAnimate'

const { KStage, KLayer, KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'BezierEditor',
  components: { KStage, KLayer, KGroup, KRect, BezierBackLayer, BezierCurveSingleComp },
  props: {
    modelValue: { type: Array as PropType<BezierCurveSingle[]>, default: () => [] },
    backgroundImg: { type: Object as PropType<any> },
    isLinear: { type: Boolean, default: true }, // 线段之间 线性/离散
    theme: { type: Object as PropType<BezierTheme> },
    comps: { type: Object as PropType<{ aboveBack?: any } & any> },
    plugins: { type: Array as PropType<BezierPlugin[]> },
  },
  model: useCompatModel.model, // 支持model；暂不支持受控
  setup(props, { emit }) {
    const { modelChange } = useCompatModel(emit)
    const stageRef = ref()
    const wrapperRef = ref<HTMLElement>()
    const { registerFunc, funcs, getStage } = useInnerMaster({ stageRef })
    const plugins = props.plugins || [PluginFlagPoint, PluginTravel]
    registerFunc({
      plugins,
    })
    const { when, whenUnbind, WhenEvent } = useWhen({ getFuncs: () => funcs })
    registerFunc({
      when,
      whenUnbind,
      WhenEvent,
    })
    const backImgInfo = computed(() => props.backgroundImg)
    const { centerAndFitImg } = useCenterAndFitImg({
      wrapperRef,
      getStage,
      backImgInfo,
    })

    // 数据 && 更新
    const { currEditMode, toggleMode, ueState, getMode, op } = useEditMode({ funcs })

    // 容器layout
    const stageConfig = ref({ width: 0, height: 0 })
    const freshLayout = function () {
      const rect = wrapperRef.value.getBoundingClientRect()
      if (rect.width) {
        stageConfig.value = {
          width: rect.width,
          height: rect.height,
        }
      }
    }
    let observer: ResizeObserver
    onMounted(async () => {
      freshLayout()
      observer = new ResizeObserver(onResize)
      observer.observe(wrapperRef.value)
      await nextTick()
      centerAndFitImg()
      getStage().on('click', onClickStage)
    })
    onBeforeUnmount(() => {
      observer?.disconnect()
      getStage().off('click', onClickStage)
    })
    const onResize = debounce(() => {
      freshLayout()
      centerAndFitImg()
    }, 500)

    registerFunc({
      isLinear: toRef(props, 'isLinear'),
      theme: merge(makeTheme(), props.theme || {}),
      currEditMode,
      centerAndFitImg,
      ueState,
      getMode,
      singleFuncsMap: {},
      flagProgressType: 'len',
    })

    // 手势交互
    const ueUtil = {
      target: 'stage',
      useBackImg() {
        ueUtil.target = 'back'
      },
      useStage() {
        ueUtil.target = 'stage'
      },
      getTarget() {
        return ueUtil.target === 'stage' ? getStage() : funcs.getBackImgNode()
      },
      onScaleChange(newScale) {
        const targetNode = ueUtil.getTarget()
        const newPos = konvaKit.scaleByPointer({ newScale, node: targetNode })
        if (!newPos) {
          return
        }

        emit('changeScale', newScale, newPos)
      },
    }
    useKonvaScale({
      wrapperRef,
      getTarget: ueUtil.getTarget,
      onScaleChange: ueUtil.onScaleChange,
    })
    useKonvaTranslate({
      wrapperRef,
      getTarget: ueUtil.getTarget,
      afterPosChange(newX, newY) {
        emit('changePos', { newX, newY })
      },
    })

    function onDeleteSingle(id: string) {
      const newValue = props.modelValue.filter(item => item.id !== id)
      modelChange(newValue, { triggerId: id })
    }

    function onChangeSingle(single: BezierCurveSingle) {
      const newValue = props.modelValue.map(item => {
        if (item.id === single.id) {
          return single
        }
        return item
      })
      modelChange(newValue, { triggerId: single.id })
    }

    function onClickStage(evt) {
      funcs.whenCall(WhenEvent.onStageClick, { evt, funcs })
    }

    return {
      stageRef,
      wrapperRef,
      stageConfig,
      funcs,
      toggleMode,
      currEditMode,
      onResize,
      backImgInfo,
      ueUtil,
      onChangeSingle,
      onDeleteSingle,
      op,
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
