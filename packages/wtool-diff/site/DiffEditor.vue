<template>
  <div class="diff-wrap">
    <div class="diff-editor-wrap" ref="diffWrap"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createMonacoDiff } from '../dist/diff-view.es.js'

import oldJson from './assets/old.json'
import newJson from './assets/new.json'

const diffWrap = ref<HTMLElement>()
let widget: any

onMounted(() => {
  if (diffWrap.value) {
    widget = createMonacoDiff(diffWrap.value, {
      originalCode: JSON.stringify(oldJson, null, 4),
      modifiedCode: JSON.stringify(newJson, null, 4),
    })
  }
})

const updateMsg = () => {
  widget?.update({ msg: `updated at ${new Date().toLocaleTimeString()}` })
}

const resetMsg = () => {
  widget?.update({ msg: 'hello from Vue' })
}

onUnmounted(() => {
  widget?.destroy()
})
</script>

<style scoped>
.diff-wrap {
  width: 650px;
  height: 150px;

  .diff-editor-wrap {
    width: 100%;
    height: 100%;
  }
}
</style>
