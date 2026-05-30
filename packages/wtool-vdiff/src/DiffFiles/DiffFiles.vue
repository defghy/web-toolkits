<template>
  <div class="diff-files-wrap">
    <Toolbar class="toolbar" />
    <div class="content-wrap">
      <FileExplore :diffFiles="diffFiles" />
      <div class="filelist-viewer-wrap"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

import { loadingDirective } from '@yuhufe/web-ui'
import type { DiffEditorOptions, WtoolDiffViewerProps, ModelOptions } from '../types'

import FileExplore from './FileExplore/FileExplore.vue'

const vLoading = loadingDirective
const loading = ref(true)

const props = withDefaults(
  defineProps<{
    diffFiles: WtoolDiffViewerProps[]
  }>(),
  {
    diffFiles: () => [],
  }
)
</script>

<style scoped>
.diff-files-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .toolbar {
    flex-shrink: 0;
  }
  .content-wrap {
    flex: 1;
    overflow: hidden;
  }
}
</style>
