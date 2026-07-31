<template>
  <VirtualScroll
    ref="virtualScrollRef"
    class="diff-list-wrap"
    :items="diffFiles"
    :itemSize="getItemSize"
    keyField="fullPath"
  >
    <template #default="{ item: file }">
      <div
        class="file-wrap"
        :class="{ 'file-wrap--selected': selectedFileKey === file.fullPath }"
        :style="{ paddingBottom: `${FILE_GAP}px` }"
      >
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
import { nextTick, ref } from 'vue'
import { VirtualScroll, useVirtual } from '@yuhufe/web-ui'
import type { DiffFileState, FileItem } from '../types'
import { useDiffFiles } from '../useDiffFiles'
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
const { funcs: diffFilesFuncs, registerFunc } = useDiffFiles()
const { selectedFileKey } = diffFilesFuncs

const selectFile = async (fullPath: string) => {
  const index = props.diffFiles.findIndex(file => file.fullPath === fullPath)
  if (index < 0) {
    selectedFileKey.value = ''
    return
  }

  selectedFileKey.value = fullPath
  await nextTick()
  funcs.virtualer?.value.scrollToIndex(index, { align: 'start' })
}

registerFunc({ selectFile })

const getViewerStyle = (file: FileItem): WtoolDiffViewerStyle => {
  const fileViewState = props.fileViewMap[file.fullPath]

  return {
    ...props.viewerStyle,
    height: `${fileViewState?.height || 0}px`,
    viewed: fileViewState?.viewed ?? false,
    rawed: fileViewState?.rawed ?? false,
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
    box-sizing: border-box;
  }

  .file-wrap--selected :deep(.diff-viewer-wrap) {
    border-color: #1677ff;
  }
}
</style>
