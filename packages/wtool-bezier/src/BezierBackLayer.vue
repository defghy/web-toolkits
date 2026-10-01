<template>
  <KLayer v-if="info">
    <!-- 默认 -->
    <KImage :config="backConfig" ref="backImg" />
  </KLayer>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { PropType, computed, defineComponent, ref, watch } from 'vue'
import { KonvaComps } from './common'

import { BackImgInfo } from './types'
import { useInner } from './userInner'

const { KLayer, KGroup, KImage } = KonvaComps

export default defineComponent({
  name: 'BezierBackgroundLayer',
  components: { KLayer, KGroup, KImage },
  props: {
    info: { type: Object as PropType<BackImgInfo> },
  },
  setup(props, { emit }) {
    const { registerFunc } = useInner()

    const backGroup = ref<any>(null)

    const imageObj = new Image()
    imageObj.src = props.info?.url
    const backConfig = computed(() => {
      const { scale, x, y, opacity = 1 } = props.info || {}
      return {
        x: x || 0,
        y: y || 0,
        image: imageObj,
        listening: false,
        scale: { x: scale, y: scale },
        opacity,
      }
    })

    // 跟随变化
    watch(
      () => props.info?.url,
      function (n) {
        imageObj.src = n
      }
    )

    const backImg = ref()
    registerFunc({
      getBackImgNode: () => backImg.value?.getNode(),
    })

    return { backGroup, backConfig, backImg }
  },
})
</script>
