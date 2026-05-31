<template>
  <div id="app">
    <div class="top-toolbar">
      <a
        href="https://stackblitz.com/~/github.com/defghy/web-toolkits?configPath=.stackblitz/pixel-demo.json&file=packages/wtool-pixel-core/site/App.vue&initialpath=/web-toolkits/pixel-demo/"
        target="_blank"
      >
        查看代码(stackblitz)
      </a>
      <PixelTool :pixelData="pixelData" />
    </div>
    <div class="palette-wrapper">
      <PixelPalette
        ref="pixelRef"
        class="palette"
        :pixelData="pixelData"
        :grid="{ size: 20 }"
        :useUndo="true"
        @change="onChangeData"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { PixelPalette } from '@yuhufe/wtool-pixel-core'
import { set } from 'lodash-es'

import PixelTool from './PixelTool/PixelTool.vue'
import data from './data.json'
import { providePixelRef } from './usePixel'

export default defineComponent({
  components: { PixelPalette, PixelTool },
  setup(props, { emit }) {
    const pixelRef = ref()
    providePixelRef(pixelRef)
    const pixelData = ref(data)
    // 数据处理
    const onChangeData = function (newData: Function | { path: string; data: any } | any) {
      if (Reflect.has(newData, 'path')) {
        const { path, data } = newData
        set(pixelData.value, path, data)
        return
      }

      if (typeof newData === 'function') {
        return newData()
      }

      pixelData.value = newData
    }

    return {
      pixelRef,
      pixelData,
      onChangeData,
    }
  },
})
</script>

<style>
body,
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;

  display: flex;
  flex-direction: column;

  .top-toolbar {
    height: 200px;
    background-color: #333;
    flex-shrink: 0;

    a {
      font-size: 14px;
      color: #91caff;
      font-weight: bold;
    }
  }
  .palette-wrapper {
    flex: 1;
  }
}
</style>
