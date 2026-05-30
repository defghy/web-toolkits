<template>
  <KGroup>
    <!-- 指标线 -->
    <KLine v-for="line in rowLines" :points="line.points" :stroke="line.color" :strokeWidth="border.size" />
    <KLine v-for="line in colLines" :points="line.points" :stroke="line.color" :strokeWidth="border.size" />
    <!-- 指标 -->
    <KText
      v-for="item in rowIndexes"
      :text="item.text"
      :x="item.x"
      :y="item.y"
      :fontSize="8"
      fill="#444"
      :verticalAlign="'middle'"
      :height="grid.size"
    />
    <KText
      v-for="item in colIndexes"
      :text="item.text"
      :x="item.x"
      :y="item.y"
      :fontSize="8"
      fill="#444"
      :align="'center'"
      :width="grid.size"
    />
  </KGroup>
</template>

<script lang="ts">
// 基准线和数字
import { PropType, computed, defineComponent, inject } from 'vue'
import { KonvaComps } from './konva'

import PixelGrid from './PixelGrid.vue'
import { useInner } from './use/useInner'
import PixelBackground from './layers/PixelBackLayer.vue'

const { KLayer, KText, KLine, KGroup } = KonvaComps

export default defineComponent({
  name: 'PixelBaseLine',
  components: { KLayer, KGroup, KText, KLine, PixelGrid, PixelBackground },
  props: {},
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { grid, border, rowNum, colNum, groupInfo } = funcs.config

    // 线比格子多1条
    const rowLines = computed(() => {
      const arr = new Array(rowNum.value + 1).fill(0)
      const bsize = border.value.size
      const gsize = grid.value.size
      const { row: grow, col: gcol } = groupInfo.value || {}

      return arr.map((r, idx) => {
        const start = { x: 0, y: (bsize + gsize) * idx }
        start.y = start.y + bsize / 2 // stroke从中心向2边，不是左上角
        const len = colNum.value * (gsize + bsize) + bsize
        const end = { x: start.x + len, y: start.y }
        const isOnGroup = idx > 0 && idx < arr.length - 1 && gcol && idx % gcol === 0
        return {
          points: [start.x, start.y, end.x, end.y],
          color: isOnGroup ? border.value.groupColor : border.value.color,
        }
      })
    })
    const colLines = computed(() => {
      const arr = new Array(colNum.value + 1).fill(0)
      const bsize = border.value.size
      const gsize = grid.value.size
      const { row: grow, col: gcol } = groupInfo.value || {}

      return arr.map((r, idx) => {
        const start = { x: (bsize + gsize) * idx, y: 0 }
        start.x = start.x + bsize / 2 // stroke从中心向2边，不是左上角
        const len = rowNum.value * (gsize + bsize) + bsize
        const end = { x: start.x, y: start.y + len }
        const isOnGroup = idx > 0 && idx < arr.length - 1 && grow && idx % grow === 0
        return {
          points: [start.x, start.y, end.x, end.y],
          color: isOnGroup ? border.value.groupColor : border.value.color,
        }
      })
    })

    // 基准线数字
    const rowIndexes = computed(() => {
      const arr = new Array(rowNum.value).fill(0)
      const bsize = border.value.size
      const gsize = grid.value.size
      return arr.map((i, idx) => {
        return {
          x: -12,
          y: idx * (gsize + bsize) + bsize,
          text: idx + 1,
        }
      })
    })

    const colIndexes = computed(() => {
      const arr = new Array(colNum.value).fill(0)
      const bsize = border.value.size
      const gsize = grid.value.size
      return arr.map((i, idx) => {
        return {
          x: idx * (gsize + bsize) + bsize,
          y: -12,
          text: idx + 1,
        }
      })
    })

    return { rowLines, colLines, border, rowIndexes, colIndexes, grid }
  },
})
</script>
