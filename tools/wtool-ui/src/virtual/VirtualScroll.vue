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
        <slot :item="items[item.index]" :index="item.index" />
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
    itemSize: { required: true, type: [Number, Function] as PropType<number | ((item: any, index: number) => number)> },
    keyField: { default: 'key', type: String },
    overscan: { default: 5, type: Number },
  },
  setup(props, { emit }) {
    const scrollCtn = ref<HTMLElement>(null as any)

    const options = computed(() => {
      return {
        count: props.items.length || 0,
        getScrollElement: () => scrollCtn.value,
        estimateSize: (index: number) => {
          const size = typeof props.itemSize === 'function' ? props.itemSize(props.items[index], index) : props.itemSize
          return Math.max(0, Number(size) || 0)
        },
        getItemKey: (index: number) => props.items[index]?.[props.keyField] ?? index,
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
    function resizeItem(key, size) {
      const index = props.items.findIndex(item => item[props.keyField] === key)
      virtualer.value.resizeItem(index, size)
    }
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

    return { scrollCtn, onScroll, totalHeight, virtualItems, getVirtualer, resizeItem }
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
