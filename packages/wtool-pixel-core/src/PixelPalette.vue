<template>
  <div class="palette" ref="wrapperRef" style="width: 100%; height: 100%">
    <KStage :config="stageConfig" ref="stageRef">
      <KLayer>
        <KGroup id="pixelBoardArea">
          <PixelBackground />
          <PixelBaseLine v-if="useBaseline" />
          <PixelLayer v-for="layer in innerLayers" :key="layer.id" :layerId="layer.id" :grids="layer.grids" />
        </KGroup>
      </KLayer>
    </KStage>
  </div>
</template>

<script lang="ts">
// 完整画板
import { PropType, computed, defineComponent, ref, onMounted, toRef, provide, watch, nextTick } from 'vue'
import { useUndo, KonvaComps } from '@yuhufe/web-common'

import { useInner } from './use/useInner'
import { PixelCommonConfig, usePixelUndo } from './use'
import { PixelLayerData, PixelGridData } from './types'
import PixelLayer from './PixelLayerGrids.vue'
import PixelBaseLine from './PixelBaseLine.vue'
import PixelBackground from './layers/PixelBackLayer.vue'

const { KStage, KLayer, KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'PixelPalette',
  components: { KStage, KLayer, KGroup, KRect, PixelLayer, PixelBaseLine, PixelBackground },
  props: {
    pixelData: { type: Array as PropType<PixelLayerData[]>, required: true },
    grid: { type: Object as PropType<Partial<PixelCommonConfig['grid']>> },
    border: { type: Object as PropType<Partial<PixelCommonConfig['border']>> },
    groupInfo: { type: Object as PropType<Partial<PixelCommonConfig['groupInfo']>> },
    layout: { type: Object as PropType<{ width: number; height: number }> },
    useBaseline: { type: Boolean, default: true },
    useUndo: { type: Boolean, default: false },
  },
  model: {
    prop: 'pixelData',
    event: 'change',
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { registerFunc, funcs } = useInner({ isMaster: true })

    // 当前组件内容提供给use
    const pixelDataRef = toRef(props, 'pixelData')
    registerFunc({
      pixelData: {
        get: () => pixelDataRef,
        set: newData => emit('change', newData),
      },
    })

    const { resolve: paletteResolve } = funcs.addRenderFlag('palette')

    const innerLayers = computed(() => {
      if (!props.pixelData?.length) {
        return []
      }
      if (props.pixelData[0].grids) {
        return props.pixelData
      }

      // 支持单层编辑
      return [
        {
          id: '1',
          name: 'layer0',
          zIndex: 0,
          grids: props.pixelData,
        },
      ] as any as PixelLayerData[]
    })
    funcs.setConfig({
      grid: props.grid,
      border: props.border,
    })
    // 数据变化，行列配置变化
    const freshPalette = async function () {
      const { setConfig, config } = funcs
      setConfig({
        rowNum: innerLayers.value[0]?.grids.length || 0,
        colNum: innerLayers.value[0]?.grids[0]?.length || 0,
      })
      if (config.rowNum.value === 0) {
        return
      }
      await nextTick()
      funcs.centerAndPosition()
      paletteResolve()
    }
    watch(
      () => props.pixelData,
      function () {
        freshPalette()
      },
      { immediate: true }
    )

    const stageConfig = ref({
      width: props.layout?.width || 500,
      height: props.layout?.height || 500,
    })
    const wrapperRef = ref<HTMLElement>(null as any)
    const stageRef = ref()
    function getStage() {
      return stageRef.value?.getNode()
    }
    onMounted(async () => {
      // 容器有布局时使用容器布局，否则使用默认
      if (!props.layout) {
        const rect = wrapperRef.value.getBoundingClientRect()
        if (rect.width) {
          Object.assign(stageConfig.value, {
            width: rect.width,
            height: rect.height,
          })
        }
      }

      freshPalette()
    })

    // redo/undo
    let historyDo = null as any
    if (props.useUndo) {
      const { pixelHistory } = usePixelUndo({ funcs })
      historyDo = useUndo({ editRecord: pixelHistory, isEnable: ref(true) as any })
    }

    registerFunc({
      getStage,
    })

    return { wrapperRef, innerLayers, stageConfig, stageRef, historyDo, funcs }
  },
})
</script>
