<template>
  <p class="hint">
    使用
    <code>createDiffViewer(容器, props)</code>
    ，与
    <code>createMonacoDiff</code>
    用法一致；底层为 Web Component（亦可
    <code>registerDiffViewer()</code>
    后
    <code>new WtoolDiffViewer()</code>
    ）。
  </p>
  <div class="diff-wrap">
    <div class="diff-editor-wrap" ref="diffWrap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createDiffViewer } from '../dist/wtool-vdiff.es.js'

import oldJson from './assets/old.json'
import newJson from './assets/new.json'

const diffWrap = ref<HTMLElement>()
let widget: any

onMounted(() => {
  if (diffWrap.value) {
    widget = createDiffViewer(diffWrap.value, {
      diffPair: [
        { filename: 'old.json', content: JSON.stringify(oldJson, null, 4) },
        { filename: 'new.json', content: JSON.stringify(newJson, null, 4) },
      ],
    })
  }
})

onUnmounted(() => {
  widget?.destroy()
})
</script>

<style scoped>
.diff-wrap {
  width: 850px;
  height: 150px;

  .diff-editor-wrap {
    width: 100%;
    height: 100%;
  }
}
</style>
