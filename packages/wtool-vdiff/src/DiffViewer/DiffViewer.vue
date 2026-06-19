<template>
  <div class="diff-viewer-wrap" :style="viewerStyle">
    <TopBar class="top-bar" :diffPair="diffPair" />
    <div class="content-wrap" v-show="!viewed" v-loading="loading">
      <MonacoDiffViewer
        class="monaco-container"
        :style="{ opacity: loading ? 0 : 1 }"
        :originalCode="originalCode"
        :modifiedCode="modifiedCode"
        :language="language"
        :options="mergedOptions"
        :modelOptions="modelOptions"
        @render-complete="onMonacoRenderComplete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

import { loadingDirective } from '@yuhufe/web-ui'
import { v4 } from '@yuhufe/web-common'
import type { DiffEditorOptions, WtoolDiffViewerProps, ModelOptions } from '../types'
import MonacoDiffViewer from './MonacoDiffViewer.vue'
import TopBar from './TopBar.vue'
import { useDiffViewer } from './useDiffView'
import { patch2Pair } from './utils/patch2Pair'
import { autoHeight } from './utils/autoHeight'
import { HEIGHT_TOP_BAR } from './const'

const vLoading = loadingDirective
const loading = ref(true)
const autoHeightId = v4()

const _renderStart = performance.now()
const onMonacoRenderComplete = async () => {
  const cost = performance.now() - _renderStart
  console.log(`[DiffViewer] 渲染耗时: ${cost.toFixed(2)} ms`)
  loading.value = false
}

const props = withDefaults(defineProps<WtoolDiffViewerProps>(), {
  diffPair: () => [],
  diffPatch: '',
  language: 'plaintext',
  options: () => ({}),
  modelOptions: () => ({}),
})

const diffPair = ref(props.diffPair || null)
const initDiff = function () {
  if (diffPair.value?.length) {
    return
  }

  // diffPatch => diffPair
  diffPair.value = patch2Pair(props.diffPatch)
}
initDiff()
console.log(`[DiffViewer] patch耗时: ${(performance.now() - _renderStart).toFixed(2)} ms`)

const originalCode = computed(() => diffPair.value[0]?.content ?? '')
const modifiedCode = computed(() => diffPair.value[1]?.content ?? '')

const { funcs, registerFunc } = useDiffViewer({ isMaster: true })

/** raw 勾选时展示全文；未勾选时折叠无变更块，仅保留差异附近的上下文行 */
const mergedOptions = computed(() => {
  // canUnchangeVisible=false（patch 模式）时，未改动区域为空行，强制折叠且忽略 rawed
  const forceHide = !canUnchangeVisible.value

  // 折叠上下文
  let hideUnchangedRegions = props.options.hideUnchangedRegions || {}
  if (!forceHide && rawed.value) {
    hideUnchangedRegions = {
      enabled: false,
      ...hideUnchangedRegions,
    }
  } else {
    hideUnchangedRegions = {
      enabled: true,
      contextLineCount: 3,
      minimumLineCount: 1,
      ...hideUnchangedRegions,
    }
  }

  return {
    ...props.options,
    hideUnchangedRegions,
  }
})

const viewed = ref<boolean>(false) // 是否已读
const rawed = ref<boolean>(false) // 是否显示原始文件
const canUnchangeVisible = ref(!props.diffPatch) // patch 模式下未改动区域为空行，不可展示

// 编辑器样式
const viewerHeight = computed(() => {
  if (props.viewerStyle?.height) {
    return props.viewerStyle.height
  }

  const heightRange = {
    minHeight: '100px',
    maxHeight: '250px',
    ...(props.viewerStyle || {}),
  }

  const height = autoHeight({
    id: autoHeightId,
    patch: props.diffPatch,
    pair: props.diffPair,
    ...heightRange,
    unchangedVisiable: funcs.rawed.value,
    unchangedCtxLineNum: mergedOptions.value.hideUnchangedRegions.contextLineCount!,
  })

  // 当前高度为代码高度，需要加上 topBar 高度才是完整高度
  return `${height + HEIGHT_TOP_BAR}px`
})
const viewerStyle = computed(() => {
  return {
    '--viewer-width': props.viewerStyle?.width || '100%',
    '--viewer-height': viewerHeight.value,
  }
})

registerFunc({
  viewed,
  rawed,
  canUnchangeVisible,
})
</script>

<style scoped>
.diff-viewer-wrap {
  width: var(--viewer-width);
  border: 1px solid #ddd;

  .top-bar {
    flex-shrink: 0;
  }
  .content-wrap {
    height: var(--viewer-height);
    overflow: hidden;
  }
}
</style>
