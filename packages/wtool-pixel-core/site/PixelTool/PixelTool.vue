<template>
  <div class="pixel-toolbar">
    <div class="item-area">
      <div
        class="toolbar-item"
        v-for="tool in tools"
        :key="tool.name"
        :class="{ active: activeTool === tool.name }"
        :title="tool.name"
        @click="chooseTool(tool.name)"
      >
        <img :src="tool.icon" />
      </div>
    </div>
    <div class="item-form-area">
      <div
        class="color-picker"
        v-for="color in colors"
        :key="color"
        @click="changeColor(color)"
        :style="{ backgroundColor: color }"
        :class="{ active: activeColor === color }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
// 自定义树形，支持自定义节点
import { computed, defineComponent, reactive, toRef, toRefs, type PropType } from 'vue'

import type { PixelLayerData } from '../types'

import { useTool } from './usePixelTool'
import { usePixelRef } from '../usePixel'

import { usePen } from './tools/usePen'
import { useEraser } from './tools/useEraser'
import { useBucket } from './tools/useBucket'
import { useMove } from './tools/useMove'

export default defineComponent({
  name: 'PixelToolbar',
  components: {},
  props: {
    pixelData: { type: Array as PropType<PixelLayerData[]>, required: true },
  },
  setup(props, { emit }) {
    const state = reactive({
      colors: ['red', 'yellowgreen', 'yellow', 'blue', 'purple'],
    })

    const { activeTool, toolForm, tools } = useTool()
    const pixelRef = usePixelRef()
    if (!pixelRef) {
      throw new Error('PixelToolbar must be used after providePixelRef')
    }
    const toolParams = { comp: pixelRef, pixelData: toRef(props, 'pixelData') }
    usePen(toolParams)
    useEraser(toolParams)
    useBucket(toolParams)
    useMove(toolParams)

    const chooseTool = function (newName) {
      if (activeTool.value === newName) {
        return
      }

      activeTool.value = newName
    }

    const changeColor = function (newColor) {
      toolForm.value.color = newColor
    }

    const activeColor = computed(() => toolForm.value.color)

    return { ...toRefs(state), tools, activeTool, activeColor, chooseTool, changeColor }
  },
})
</script>

<style scoped>
.pixel-toolbar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .item-area {
    width: 200px;
    padding: 12px 0;
  }
  .item-form-area {
    margin-bottom: 8px;

    .color-picker {
      display: inline-block;
      width: 28px;
      height: 28px;
      margin: 0 8px 8px 0;
      border: 2px solid transparent;
      cursor: pointer;

      &.active {
        border-color: #fff;
      }
    }
  }
}
.toolbar-item {
  display: inline-flex;
  background-color: #3a3a3a;
  margin: 1px;
  width: 46px;
  height: 46px;
  cursor: pointer;
  border: 2px solid #666;
  justify-content: center;
  &:hover {
    background-color: #444;
    border-color: #999;
  }
  &.active {
    border-color: #fffb8f;
  }

  img {
    width: auto;
    height: 100%;
  }
}
</style>
