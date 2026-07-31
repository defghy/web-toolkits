<template>
  <div class="diff-files-wrap">
    <div class="content-wrap">
      <FileExplore class="file-explore" :diffFiles="files" @select-file="emit('select-file', $event)" />
      <div class="filelist-viewer-wrap">
        <DiffList
          :diffFiles="files"
          :fileOverScan="fileOverScan"
          :fileViewMap="fileViewMap"
          :viewerStyle="viewerStyle"
          @viewStateChange="freshViewState"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue'
import type { WtoolDiffFilesProps } from '../types'

import FileExplore from './FileExplore/FileExplore.vue'
import { useDiffFiles, formatDiffFiles } from './useDiffFiles'
import type { DiffFileState, FileItem } from './types'
import type { DiffFileSelection } from './FileExplore/fileTree'
import DiffList from './DiffList/DiffList.vue'
import { autoHeight, height2Num } from '@/DiffViewer/utils/autoHeight'

const props = withDefaults(defineProps<WtoolDiffFilesProps>(), {
  diffFiles: () => [],
  fileOverScan: 30,
  viewerStyle: () => ({}),
})

const { files, fileMap } = formatDiffFiles(props.diffFiles)
const DEFAULT_CONTEXT_LINE_COUNT = 3

const calculateViewerHeight = (file: FileItem) => {
  const state = fileViewMap[file.fullPath]
  if (props.viewerStyle.height) {
    return height2Num(props.viewerStyle.height)
  }

  const fileHeight = (() => {
    const heightRange = {
      minHeight: '0px',
      maxHeight: '500px',
      ...props.viewerStyle,
    }
    const height = autoHeight({
      id: file.fullPath,
      patch: file.diffPatch,
      pair: file.diffPair,
      minHeight: heightRange.minHeight,
      maxHeight: heightRange.maxHeight,
      unchangedVisiable: state.rawed,
      unchangedCtxLineNum: DEFAULT_CONTEXT_LINE_COUNT,
      unchangedMinLineNum: 1,
    })

    return height
  })()

  return fileHeight
}
const fileViewMap = reactive(
  Object.fromEntries(
    files.map(file => [
      file.fullPath,
      {
        height: 0,
        viewed: false,
        rawed: false,
      },
    ])
  )
)
onBeforeMount(() => {
  // 初始计算高度
  Object.entries(fileViewMap).forEach(([key, viewFile]) => {
    freshViewState(fileMap[key])
  })
})

const emit = defineEmits<{
  'select-file': [selection: DiffFileSelection]
}>()
useDiffFiles({ isMaster: true })

const freshViewState = (file: FileItem, newViewState = {}) => {
  const state = fileViewMap[file.fullPath]
  Object.assign(state, newViewState)
  state.height = calculateViewerHeight(file)
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
      overflow: hidden;
    }
  }
}
</style>
