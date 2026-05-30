<template>
  <KGroup ref="layer">
    <KGroup v-for="(rows, r) in grids">
      <PixelGrid
        v-for="(grid, c) in rows"
        :key="`${r}_${c}`"
        :grid="grid"
        :row="r"
        :col="c"
        :id="getId(grid)"
        :layerId="layerId"
      />
    </KGroup>
  </KGroup>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { PropType, computed, defineComponent, ref, toRef, onMounted, nextTick } from 'vue'
import type Konva from 'konva'
import { useArrKey, usePress, konvaKit, KonvaComps } from '@yuhufe/web-common'

import PixelGrid from './PixelGrid.vue'
import { useInner } from './use/useInner'
import { PixelGridData, PressEvent } from './types'

const { KLayer, KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'PixelGrids',
  components: { KLayer, KGroup, KRect, PixelGrid },
  props: {
    grids: { type: Array as PropType<PixelGridData[][]>, required: true },
    layerId: { type: String, required: true },
  },
  setup(props, { emit }) {
    const { funcs } = useInner()
    const allGrids = computed(() => props.grids.flat())
    const { id2Idx, idx2Id, getId } = useArrKey({ arr: allGrids as any })
    const { colNum } = funcs.config

    // 根据点击元素返回grid数据
    const getTargetGrid = function (target: Konva.Node) {
      const targetGroup = konvaKit.findParent(target, function (curr) {
        return curr.name() === 'pixelGridGroup'
      })

      if (!targetGroup) {
        return
      }

      const id = targetGroup.id()
      const idx = id2Idx(id)
      const r = Math.floor(idx / colNum.value)
      const c = idx % colNum.value
      return {
        r,
        c,
        grid: allGrids.value[idx],
      }
    }

    const layer = ref(null as any)

    // 途经的grid列表
    const call = funcs.whenCall
    let passByGrids = [] as any[]
    let last = {} as any
    usePress({
      targetKonvaEl: async function () {
        return layer.value.getNode()
      },
      onPressStart({ target, evt }) {
        const targetGrid = getTargetGrid(target)
        if (!targetGrid) {
          return
        }

        if (targetGrid?.grid?.disabled) return

        passByGrids = [targetGrid]
        const { r, c, grid } = targetGrid
        call('onGridPressed', { evt, r, c, currGrid: grid, passByGrids, layerId: props.layerId })
      },
      onPressMove({ target, evt }) {
        // 同一个grid不重复调用
        if (last.target === target) {
          return
        }
        last.target = target
        const targetGrid = getTargetGrid(target)
        if (!targetGrid) {
          return
        }
        if (targetGrid?.grid?.disabled) return
        if (last.grid === targetGrid.grid) {
          return
        }
        last.grid = targetGrid.grid
        if (!passByGrids.includes(targetGrid)) {
          passByGrids.push(targetGrid)
        }

        const { r, c, grid } = targetGrid
        call('onGridPressed', { evt, r, c, currGrid: grid, passByGrids, layerId: props.layerId })
      },
      onPressEnd({ target, evt }) {
        const targetGrid = getTargetGrid(target)
        if (targetGrid?.grid?.disabled) return
        if (targetGrid) {
          if (!passByGrids.includes(targetGrid)) {
            passByGrids.push(targetGrid)
          }

          const { r, c, grid } = targetGrid
          call('onGridPressed', { evt, r, c, currGrid: grid, passByGrids, layerId: props.layerId })
        }

        passByGrids = []
      },
    })

    return {
      getId,
      layer,
    }
  },
})
</script>
