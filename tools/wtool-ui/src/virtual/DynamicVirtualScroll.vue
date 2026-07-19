<template>
  <div ref="parentRef" class="scroll-wrapper">
    <div
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        :style="{
          transform: `translateY(${virtualRows[0]?.start ?? 0}px)`,
        }"
      >
        <div
          v-for="virtualRow in virtualRows"
          :key="virtualRow.key"
          :data-index="virtualRow.index"
          :ref="measureElement"
        >
          <slot :item="items[virtualRow.index]" :index="virtualRow.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useVirtual } from './useVirtual'

export default defineComponent({
  name: 'DynamicVirtualScroll',
  props: {
    items: { required: true, type: Array as PropType<any[]> },
    keyField: { default: 'key' },
  },
  setup(props) {
    const parentRef = ref<HTMLElement | null>(null)

    const rowVirtualizer = useVirtualizer({
      get count() {
        return props.items.length || 0
      },
      getScrollElement: () => parentRef.value,
      estimateSize: () => 55,
    })

    const virtualRows = computed(() => {
      const items = rowVirtualizer.value?.getVirtualItems() || []
      return items.map(item => {
        const itemsItem = props.items[item.index]
        return {
          ...item,
          key: itemsItem?.[props.keyField] ?? item.key,
        }
      })
    })

    const totalSize = computed(() => rowVirtualizer.value?.getTotalSize() || 0)

    const measureElement = (el: Element | null) => {
      if (!el) {
        return
      }

      rowVirtualizer.value.measureElement(el)

      return undefined
    }

    const { registerFunc } = useVirtual({ isMaster: false })
    registerFunc({
      virtualer: rowVirtualizer,
    })

    return {
      virtualRows,
      totalSize,
      measureElement,
      parentRef,
    }
  },
})
</script>

<style scoped lang="less">
.scroll-wrapper {
  height: 100%;
  overflow-y: auto;
  contain: strict;
  scrollbar-width: thin;

  .virtual-item {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
