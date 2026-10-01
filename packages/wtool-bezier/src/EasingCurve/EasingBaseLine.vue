<template>
  <KGroup>
    <!-- 指标线 -->
    <KLine
      :points="[curve.start.x, curve.start.y, curve.end.x, curve.end.y]"
      :stroke="lineColor"
      :strokeWidth="lineWidth"
      :dash="[2, 2]"
    />
    <KLine
      v-for="(line, index) in rowLines"
      :key="`row-${index}`"
      :points="line.points"
      :stroke="lineColor"
      :strokeWidth="lineWidth"
    />
    <KLine
      v-for="(line, index) in colLines"
      :key="`col-${index}`"
      :points="line.points"
      :stroke="lineColor"
      :strokeWidth="lineWidth"
    />
    <!-- 轴名称 -->
    <KText
      :text="axisLabel.xLabel"
      :y="SideLength + 4"
      :fontSize="6"
      fill="#eee"
      :align="'center'"
      :width="SideLength"
    />
    <KText :text="axisLabel.yLabel" :x="-4" :y="30" :fontSize="6" fill="#eee" :rotation="90" />
  </KGroup>
</template>

<script lang="ts">
// 基准线和数字
import { PropType, computed, defineComponent, inject } from 'vue'
import { KonvaComps } from '../common'

import { BezierCurveInfo } from '../types'
import { useEasingCurve } from './useEasingCurve'

const { KLayer, KText, KLine, KGroup } = KonvaComps

export default defineComponent({
  name: 'EasingBaseLine',
  components: { KLayer, KGroup, KText, KLine },
  props: {
    curve: { type: Object as PropType<Pick<BezierCurveInfo, 'start' | 'end'>>, required: true },
  },
  setup(props, { emit }) {
    const { SideLength } = useEasingCurve()
    const gridNum = 10
    const gridSize = Math.round(SideLength / gridNum) // 线间距/格子宽度

    // 线比格子多1条
    const rowLines = computed(() => {
      const arr = new Array(gridNum + 1).fill(0)

      return arr.map((r, idx) => {
        const start = { x: 0, y: gridSize * idx }
        const len = gridNum * gridSize
        const end = { x: start.x + len, y: start.y }
        return {
          points: [start.x, start.y, end.x, end.y],
        }
      })
    })
    const colLines = computed(() => {
      const arr = new Array(gridNum + 1).fill(0)

      return arr.map((r, idx) => {
        const start = { x: gridSize * idx, y: 0 }
        const len = gridNum * gridSize
        const end = { x: start.x, y: start.y + len }
        return {
          points: [start.x, start.y, end.x, end.y],
        }
      })
    })

    const axisLabel = computed(() => {
      const offset = 4
      return {
        xLabel: '时间进度',
        yLabel: '动画进度',
        offset,
      }
    })

    return { rowLines, colLines, lineColor: '#999', lineWidth: 0.5, SideLength, axisLabel }
  },
})
</script>
