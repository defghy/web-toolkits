<template>
  <KGroup
    :x="layout.x"
    :y="layout.y"
    :width="gridSize"
    :height="gridSize"
    name="pixelGridGroup"
    :id="id"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <!-- 默认 -->
    <KRect
      v-if="!gridRender || grid.disabled"
      :config="rectConfig"
      :x="0"
      :y="0"
      :width="gridSize"
      :height="gridSize"
    />
    <component v-else :is="gridRender" :grid="grid" :gridSize="gridSize" :isHover="isHover" :row="row" :col="col" />
  </KGroup>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { PropType, computed, defineComponent, ref, inject } from 'vue'
import { KonvaComps } from './konva'

import { useInner } from './use/useInner'
import { PixelGridData } from './types'

const { KLayer, KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'PixelGrid',
  components: { KLayer, KGroup, KRect },
  props: {
    grid: { type: Object as PropType<PixelGridData>, required: true },
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    id: String,
    layerId: { type: String },
  },
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { grid: gridCfg, border } = funcs.config
    const call = funcs.whenCall
    const layout = computed(() => {
      const size = gridCfg.value.size
      const bsize = border.value.size
      const { col, row } = props
      return {
        x: size * col + bsize * (col + 1),
        y: size * row + bsize * (row + 1),
        width: size,
        height: size,
      }
    })
    const gridSize = computed(() => gridCfg.value.size)

    const isHover = ref(false)
    const onPointerEnter = function (evt: PointerEvent) {
      if (props.grid.disabled) {
        const container = funcs.getStage().container()
        container.style.cursor = 'not-allowed'
        return
      }
      isHover.value = true
      call('onGridHover', { r: props.row, c: props.col, grid: props.grid, layerId: props.layerId })
    }
    const onPointerLeave = function (evt: PointerEvent) {
      if (props.grid.disabled) {
        const container = funcs.getStage().container()
        container.style.cursor = ''
      }
      isHover.value = false
    }

    const rectConfig = computed(() => {
      if (props.grid.disabled) {
        return {
          fill: '#ededed',
          strokeWidth: 1,
          stroke: '#fff',
        }
      }

      return {
        fill: props.grid.color,
        strokeWidth: isHover.value ? 2 : 0,
        stroke: '#fffb8f',
      }
    })

    return {
      layout,
      gridSize,
      onPointerEnter,
      onPointerLeave,
      isHover,
      rectConfig,
      gridRender: gridCfg.value.render,
    }
  },
})
</script>
