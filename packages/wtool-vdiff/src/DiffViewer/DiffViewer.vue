<template>
  <div class="diff-viewer-wrap">
    <TopBar class="top-bar" :diffPair="diffPair" />
    <div class="content-wrap">
      <MonacoDiffViewer
        class="monaco-container"
        :originalCode="originalCode"
        :modifiedCode="modifiedCode"
        :language="language"
        :options="options"
        :modelOptions="modelOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'

import type { DiffEditorOptions, ModelOptions } from './props'
import MonacoDiffViewer from './MonacoDiffViewer.vue'
import TopBar from './TopBar.vue'

const props = withDefaults(
  defineProps<{
    diffPair?: { filename: string; content: string }[]
    diffPatch?: string
    language?: string
    options?: DiffEditorOptions
    modelOptions?: ModelOptions
    width?: string
    height?: string
  }>(),
  {
    diffPair: () => [],
    diffPatch: '',
    language: 'plaintext',
    options: () => ({}),
    modelOptions: () => ({}),
    width: '100%',
    height: '400px',
  }
)

const originalCode = computed(() => props.diffPair[0].content)
const modifiedCode = computed(() => props.diffPair[1].content)
</script>

<style scoped>
.diff-viewer-wrap {
  min-height: 200px;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;

  .top-bar {
    flex-shrink: 0;
  }
  .content-wrap {
    flex: 1;
    overflow: hidden;
  }
}
</style>
