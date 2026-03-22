<template>
  <div class="top-bar-wrap">
    <div class="title-area">
      <div class="filename">{{ filename }}</div>
      <div class="diff-line-num">
        <div class="add">+12</div>
        <div class="del">-111</div>
      </div>
    </div>
    <div class="toolbar"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import MonacoDiffViewer from './MonacoDiffViewer.vue'

import type { DiffEditorOptions, ModelOptions } from './props'

const props = withDefaults(
  defineProps<{
    diffPair?: { filename: string; content: string }[]
  }>(),
  {
    diffPair: () => [],
  }
)

const filename = computed(() => props.diffPair[0].filename)
</script>

<style scoped>
.top-bar-wrap {
  height: 32px;
  flex-shrink: 0;

  display: flex;
  align-items: center;

  .title-area {
    flex: 1;
  }
  .toolbar {
    flex-shrink: 0;
  }
}
</style>
