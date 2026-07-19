<template>
  <div class="diff-list-wrap">
    <div class="file-wrap" v-for="file in diffFiles" :key="file.fullPath">
      <DiffViewer
        :fileId="file.fullPath"
        :diffPair="file.diffPair"
        :diffPatch="file.diffPatch"
        :viewerStyle="viewerStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import type { FileItem } from '../types'
import { WtoolDiffViewerStyle } from '@/types'
import DiffViewer from '@/DiffViewer/DiffViewer.vue'

const props = withDefaults(
  defineProps<{
    diffFiles: FileItem[]
    viewerStyle?: WtoolDiffViewerStyle
  }>(),
  {
    diffFiles: () => [],
    viewerStyle: () => ({}),
  }
)

// 统计高度
onBeforeMount(() => {})
</script>

<style scoped>
.diff-list-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  padding: 8px;
  box-sizing: border-box;

  .file-wrap {
    margin-bottom: 12px;
  }
}
</style>
