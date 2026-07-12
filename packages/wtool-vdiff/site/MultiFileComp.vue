<template>
  <div class="multi-file-demo">
    <div class="demo-toolbar">
      <span class="file-count">{{ fixtureFiles.length.toLocaleString() }} files</span>
    </div>

    <div class="multi-file-stage">
      <DiffFiles :diffFiles="fixtureFiles" @select-file="selectedFile = $event" />
    </div>

    <div class="selection-status" :title="selectedFile?.path">
      <strong>Selected:</strong>
      <span>{{ selectedFile?.path || 'None' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import DiffFiles from '../src/DiffFiles/DiffFiles.vue'
import type { DiffFileSelection } from '../src/DiffFiles/FileExplore/fileTree'
import type { FileTree } from '../src/types'
import fileListDiff from './assets/fileListDiff.json'

const fixtureFiles = fileListDiff as FileTree[]
const selectedFile = ref<DiffFileSelection | null>(null)
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

.mode-switch {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid #cbd2d9;
  border-radius: 6px;
}

.mode-switch button {
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-right: 1px solid #cbd2d9;
  color: #3d4650;
  background: #fff;
  cursor: pointer;
}

.mode-switch button:last-child {
  border-right: 0;
}

.mode-switch button.active {
  color: #fff;
  background: #1261a6;
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
