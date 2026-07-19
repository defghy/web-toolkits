<template>
  <div class="scroll-wrapper" ref="scrollCtn" @scroll="onScroll">
    <div class="scroll-inner-wrapper" :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        class="virtual-item"
        v-for="item in virtualItems"
        :key="item.key"
        :style="{
          height: `${item.size}px`,
          transform: `translateY(${item.start}px)`,
        }"
      >
        <slot :item="items[item.index]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue'
// docs: https://tanstack.com/virtual/latest/docs/introduction
import { useVirtualizer } from '@tanstack/vue-virtual'

import { useVirtual } from './useVirtual'

export default defineComponent({
  name: 'VirtualScroll',
  props: {
    items: { required: true, type: Array as PropType<any[]> },
    itemSize: { required: true, type: Number },
    keyField: { default: 'key' },
    overscan: { default: 5 },
  },
  setup(props, { emit }) {
    const scrollCtn = ref<HTMLElement>(null as any)

    const options = computed(() => {
      return {
        count: props.items.length || 0,
        getScrollElement: () => scrollCtn.value,
        estimateSize: () => props.itemSize,
        overscan: props.overscan,
      }
    })
    const virtualer = useVirtualizer(options)

    const totalHeight = computed(() => virtualer.value?.getTotalSize() || 0)

    const virtualItems = computed(() => {
      const items = virtualer.value?.getVirtualItems() || []
      return items.map(item => {
        const itemsItem = props.items[item.index]
        return {
          ...item,
          key: itemsItem?.[props.keyField] ?? item.key,
        }
      })
    })

    const getVirtualer = () => virtualer.value
    const { registerFunc } = useVirtual({ isMaster: false })
    registerFunc({
      virtualer,
    })

    // 滚动时
    let lastScrollTop = 0
    let lastScrollLeft = 0
    function onScroll(evt: Event) {
      const { scrollTop, scrollLeft } = evt.target as HTMLElement
      if (scrollTop !== lastScrollTop) {
        lastScrollTop = scrollTop
        emit('scrollY', { scrollTop, evt })
      }
      if (scrollLeft !== lastScrollLeft) {
        lastScrollLeft = scrollLeft
        emit('scrollX', { scrollLeft, evt })
      }
    }

    return { scrollCtn, onScroll, totalHeight, virtualItems, getVirtualer }
  },
})
</script>
<style scoped lang="less">
.scroll-wrapper {
  overflow-y: auto;
  scrollbar-width: thin;

  .virtual-item {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
