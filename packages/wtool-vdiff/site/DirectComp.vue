<template>
  <p class="hint">常规组件</p>
  <div class="diff-wrap">
    <DiffViewer :diffPair="diffPair" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DiffViewer from '../src/DiffViewer/DiffViewer.vue'

import oldJson from './assets/old.json'
import newJson from './assets/new.json'

const diffPair = [
  { filename: 'old.json', content: JSON.stringify(oldJson, null, 4) },
  { filename: 'new.json', content: JSON.stringify(newJson, null, 4) },
]
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
