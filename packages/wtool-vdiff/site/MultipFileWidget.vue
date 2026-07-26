<template>
  <div class="multi-file-demo">
    <div class="demo-toolbar">
      <span class="file-count">{{ fixtureFiles.length.toLocaleString() }} files</span>
    </div>

    <div class="multi-file-stage">
      <div ref="wrapMultiFile" class="multi-file-widget"></div>
    </div>

    <div class="selection-status" :title="selectedFile?.fullPath">
      <strong>Selected:</strong>
      <span>{{ selectedFile?.fullPath || 'None' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createDiffFiles } from '../dist/wtool-vdiff.es.js'

import fileListDiff from './assets/fileListDiff.json'

const fixtureFiles = (fileListDiff as any[]).map(file => {
  return {
    fullPath: file.filePath,
    diffPatch: file.diffPatch,
  }
})
const selectedFile = ref<{ fullPath: string } | null>(null)
const wrapMultiFile = ref<HTMLElement>()

let widget: ReturnType<typeof createDiffFiles>

onMounted(() => {
  widget = createDiffFiles(wrapMultiFile.value!, {
    diffFiles: fixtureFiles,
  })
  widget.onSelectFile(selection => {
    selectedFile.value = selection
  })
})

onUnmounted(() => {
  widget?.destroy()
})
</script>

<style scoped>
.multi-file-demo {
  width: 100%;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.file-count {
  color: #59636e;
  font-size: 13px;
  white-space: nowrap;
}

.multi-file-stage {
  width: 100%;
  height: 560px;
  overflow: hidden;
  border: 1px solid #cbd2d9;
  box-sizing: border-box;
}

.multi-file-widget {
  width: 100%;
  height: 100%;
}

.multi-file-widget :deep(wtool-diff-files) {
  display: block;
  width: 100%;
  height: 100%;
}

.selection-status {
  display: flex;
  gap: 6px;
  min-width: 0;
  margin-top: 10px;
  color: #3d4650;
  font-size: 13px;
}

.selection-status span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
