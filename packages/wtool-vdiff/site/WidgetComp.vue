<template>
  <p class="hint">pair组件</p>
  <div class="diff-wrap">
    <div ref="wrapPair" class="diff-editor-wrap"></div>
  </div>

  <p class="hint">pairLarge组件</p>
  <div class="diff-wrap">
    <div ref="wrapPairLarge" class="diff-editor-wrap"></div>
  </div>

  <p class="hint">patch字符串</p>
  <div class="diff-wrap">
    <div ref="wrapPatch" class="diff-editor-wrap"></div>
  </div>

  <p class="hint">超长patch字符串</p>
  <div class="diff-wrap">
    <div ref="wrapLarge" class="diff-editor-wrap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createDiffViewer } from '../dist/wtool-vdiff.es.js'

import { pair, pairLarge, patch, patchLarge } from './data.js'

const wrapPair = ref<HTMLElement>()
const wrapPatch = ref<HTMLElement>()
const wrapLarge = ref<HTMLElement>()
const wrapPairLarge = ref<HTMLElement>()

let widgetPair: ReturnType<typeof createDiffViewer>
let widgetPatch: ReturnType<typeof createDiffViewer>
let widgetLarge: ReturnType<typeof createDiffViewer>
let widgetPairLarge: ReturnType<typeof createDiffViewer>

onMounted(() => {
  widgetPair = createDiffViewer(wrapPair.value!, {
    diffPair: pair,
  })

  widgetPairLarge = createDiffViewer(wrapPairLarge.value!, {
    diffPair: pairLarge,
    viewerStyle: { height: '500px' },
  })

  widgetPatch = createDiffViewer(wrapPatch.value!, {
    diffPatch: patch,
  })

  widgetLarge = createDiffViewer(wrapLarge.value!, {
    diffPatch: patchLarge,
  })
})

onUnmounted(() => {
  widgetPair?.destroy()
  widgetPatch?.destroy()
  widgetLarge?.destroy()
})
</script>

<style scoped>
.diff-wrap {
  width: 850px;

  .diff-editor-wrap {
    width: 100%;
    height: 100%;
  }
}
</style>
