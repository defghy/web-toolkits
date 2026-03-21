<template>
  <div class="diff-viewer-wrap">
    <MonacoDiffViewer 
      :originalCode="originalCode"
      :modifiedCode="modifiedCode"
      :language="language" 
      :options="options" 
      :modelOptions="modelOptions" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import MonacoDiffViewer from './MonacoDiffViewer.vue';

import type{ DiffEditorOptions, ModelOptions } from './props'

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
    modifiedCode: '',
    language: 'plaintext',
    options: () => ({}),
    modelOptions: () => ({}),
    width: '100%',
    height: '400px',
  },
)

const originalCode = computed(() => props.diffPair[0].content)
const modifiedCode = computed(() => props.diffPair[1].content)


</script>

<style scoped>
.diff-viewer-wrap {
  min-height: 200px;
}
</style>
