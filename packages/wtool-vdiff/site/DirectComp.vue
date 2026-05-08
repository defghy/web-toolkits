<template>
  <p class="hint">pair组件</p>
  <div class="diff-wrap">
    <DiffViewer :diffPair="diffPair" :viewerStyle="{ height: '250px' }" />
  </div>

  <p class="hint">patch字符串</p>
  <div class="diff-wrap">
    <DiffViewer :diffPatch="patch" :viewerStyle="{ height: '250px' }" />
  </div>

  <p class="hint">超长patch字符串</p>
  <div class="diff-wrap">
    <DiffViewer :diffPatch="patchLarge" :viewerStyle="{ height: '250px' }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DiffViewer from '../src/DiffViewer/DiffViewer.vue'

import oldJson from './assets/old.json'
import newJson from './assets/new.json'
import miniPatch from './assets/miniPatch.json'
import largePatch from './assets/largePatch.json'

const diffPair = [
  { filename: 'old.json', content: JSON.stringify(oldJson, null, 4) },
  { filename: 'new.json', content: JSON.stringify(newJson, null, 4) },
]

const viewerStyle = { height: '' }

const patch = miniPatch.patch
const patchLarge = largePatch.patch
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
