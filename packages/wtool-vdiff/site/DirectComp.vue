<template>
  <p class="hint">pair组件</p>
  <div class="diff-wrap">
    <DiffViewer :diffPair="diffPair" :viewerStyle="{ height: '250px' }" />
  </div>

  <p class="hint">pair大</p>
  <div class="diff-wrap">
    <DiffViewer :diffPair="diffPairLarge" :viewerStyle="{ height: '500px' }" />
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

import { patch, patchLarge, pair, pairLarge } from './data'

const diffPair = pair
const diffPairLarge = pairLarge
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
