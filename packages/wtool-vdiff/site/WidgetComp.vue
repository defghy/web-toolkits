<template>
  <p class="hint">pair组件</p>
  <div class="diff-wrap">
    <div ref="wrapPair" class="diff-editor-wrap"></div>
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

import oldJson from './assets/old.json'
import newJson from './assets/new.json'
import miniPatch from './assets/miniPatch.json'
import largePatch from './assets/largePatch.json'

const wrapPair = ref<HTMLElement>()
const wrapPatch = ref<HTMLElement>()
const wrapLarge = ref<HTMLElement>()

let widgetPair: ReturnType<typeof createDiffViewer>
let widgetPatch: ReturnType<typeof createDiffViewer>
let widgetLarge: ReturnType<typeof createDiffViewer>

onMounted(() => {
  widgetPair = createDiffViewer(wrapPair.value!, {
    diffPair: [
      { filename: 'old.json', content: JSON.stringify(oldJson, null, 4) },
      { filename: 'new.json', content: JSON.stringify(newJson, null, 4) },
    ],
  })

  widgetPatch = createDiffViewer(wrapPatch.value!, {
    diffPatch: miniPatch.patch,
  })

  widgetLarge = createDiffViewer(wrapLarge.value!, {
    diffPatch: largePatch.patch,
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
