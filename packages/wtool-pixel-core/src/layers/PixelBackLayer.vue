<template>
  <KGroup ref="backGroup">
    <!-- 默认 -->
    <KImage v-if="!backLayerRender" id="backImage" :config="backConfig" />
    <component v-else :is="backLayerRender" :rect="boardRect" />
  </KGroup>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { PropType, computed, defineComponent, ref } from 'vue'
import { KonvaComps } from '@yuhufe/web-common'

import { useInner } from '../use/useInner'

const { KLayer, KGroup, KImage } = KonvaComps

export default defineComponent({
  name: 'PixelBackgroundLayer',
  components: { KLayer, KGroup, KImage },
  props: {},
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { board: boardCfg, boardRect } = funcs.config
    const { resolve: backResolve } = funcs.addRenderFlag('background')

    const backGroup = ref<any>(null)

    const imageObj = new Image()
    imageObj.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAk8AAAJPAQMAAABfCaItAAAABlBMVEXi4uL9/f0Pi++YAAAA/klEQVR42u3WsQ1AABiE0ROF0ghGMRqjGcUISoX4LaAiGnnlNa+8fKkjXW0ZaslUaV7MoFCo31Bpa09fa8aaU+fzeaJQKNQN5ZBRKJSSQaFQSsa3o1AoJYNCoZQMCoVSMr4dhUIpGRQKpWRQKJSSccgoFErJoFAoJYNCoZSMQ0ahUEoGhUIpGRQKhVIyKBRKyaBQKCXj21EolJJBoVBKBoVCKRmHjEKhlAwKhVIyKBRKyThkFAqlZFAolJJBoVAoJYNCoZQMCoVSMr4dhUIpGRQKpWRQKJSS8e0oFErJoFAoJYNCoZSMQ0ahUEoGhUIpGRQKpWQcMgqFUjKoj6kLvu8XE5xj268AAAAASUVORK5CYII=`
    imageObj.onload = function () {
      backResolve()
    }
    const backConfig = computed(() => {
      return {
        x: 0,
        y: 0,
        width: boardRect.value.width,
        height: boardRect.value.height,
        image: imageObj,
        listening: false,
      }
    })

    return { backGroup, backLayerRender: boardCfg.value.backLayerRender, boardRect, backConfig }
  },
})
</script>
