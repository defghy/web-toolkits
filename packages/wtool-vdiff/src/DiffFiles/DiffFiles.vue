<template>
  <div class="diff-files-wrap">
    <div class="content-wrap">
      <FileExplore class="file-explore" :diffFiles="files" @select-file="handleSelectFile" />
      <div class="filelist-viewer-wrap"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileTree } from '../types'

import FileExplore from './FileExplore/FileExplore.vue'
import { fileTree2FileList } from './useDiffFiles'
import type { DiffFileSelection } from './FileExplore/fileTree'

const props = withDefaults(
  defineProps<{
    diffFiles: FileTree[]
  }>(),
  {
    diffFiles: () => [],
  }
)

const { files, fileMap } = fileTree2FileList(props.diffFiles)

const emit = defineEmits<{
  'select-file': [selection: DiffFileSelection]
}>()

const handleSelectFile = (selection: DiffFileSelection) => {
  emit('select-file', selection)
}
</script>

<style scoped>
.diff-files-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .content-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;

    .file-explore {
      width: 300px;
      min-width: 220px;
      max-width: 40%;
      flex: 0 0 300px;
      border-right: 1px solid #dfe3e8;
      box-sizing: border-box;
    }

    .filelist-viewer-wrap {
      min-width: 0;
      flex: 1;
    }
  }
}
</style>
