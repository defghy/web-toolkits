<template>
  <VirtualScroll
    ref="virtualScrollRef"
    class="diff-list-wrap"
    :items="diffFiles"
    :itemSize="getItemSize"
    keyField="fullPath"
  >
    <template #default="{ item: file, index }">
      <div class="file-wrap">
        <DiffViewer
          :fileId="file.fullPath"
          :diffPair="file.diffPair"
          :diffPatch="file.diffPatch"
          :viewerStyle="getViewerStyle(file)"
          @viewStateChange="handleViewStateChange(file, $event)"
        />
      </div>
    </template>
  </VirtualScroll>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VirtualScroll, useVirtual } from '@yuhufe/web-ui'
import type { DiffFileState, FileItem } from '../types'
import type { WtoolDiffViewerStyle } from '@/types'
import DiffViewer from '@/DiffViewer/DiffViewer.vue'
import { HEIGHT_TOP_BAR } from '@/DiffViewer/const'

const FILE_GAP = 12
const VIEWER_BORDER_HEIGHT = 2
const BASE_HEIGHT = HEIGHT_TOP_BAR + VIEWER_BORDER_HEIGHT + FILE_GAP

const props = withDefaults(
  defineProps<{
    diffFiles: FileItem[]
    fileViewMap: Record<string, DiffFileState>
    viewerStyle?: WtoolDiffViewerStyle
  }>(),
  {
    diffFiles: () => [],
    fileViewMap: () => ({}),
    viewerStyle: () => ({}),
  }
)

const emit = defineEmits<{
  'view-state-change': [file: FileItem, state: Partial<DiffFileState>]
}>()

const virtualScrollRef = ref(null)
const { funcs } = useVirtual()

const getViewerStyle = (file: FileItem): WtoolDiffViewerStyle => {
  return {
    ...props.viewerStyle,
    height: `${props.fileViewMap[file.fullPath]?.height || 0}px`,
  }
}

const getItemSize = (file: FileItem): number => {
  let { height, viewed } = props.fileViewMap[file.fullPath]
  // 此时代码隐藏
  if (viewed) {
    height = 0
  }
  return height + BASE_HEIGHT
}

const handleViewStateChange = (file: FileItem, state: Partial<DiffFileState>) => {
  emit('view-state-change', file, state)
  funcs.resizeItem(file.fullPath, getItemSize(file))
}
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
    height: 100%;
    padding-bottom: 12px;
    box-sizing: border-box;
  }
}
</style>
