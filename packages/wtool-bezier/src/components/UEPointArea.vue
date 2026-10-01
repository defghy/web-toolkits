<template>
  <KGroup>
    <slot />
    <KCircle :config="config" :radius="radius" :draggable="true" v-on="$listeners"></KCircle>
  </KGroup>
</template>

<script lang="ts">
// 交互区域比看起来的大；大圆盖住小圆，交互都在大圆上面
import { PropType, computed, defineComponent, ref, toRef } from 'vue'
import { KonvaComps } from '../common'
import { Point, ControlPoint } from '../types'
import { useInner, useSeg } from '../userInner'

const { KGroup, KCircle, KLine } = KonvaComps

export default defineComponent({
  name: 'UEArea',
  components: { KGroup, KCircle, KLine },
  props: {
    pos: { type: Object as PropType<Point>, required: true },
  },
  setup(props, { emit }) {
    const { funcs } = useInner()
    const radius = funcs.theme.pointSize * 2

    // 控制点配置
    const config = computed(() => {
      return {
        x: props.pos.x,
        y: props.pos.y,
      }
    })

    return {
      config,
      radius,
    }
  },
})
</script>
