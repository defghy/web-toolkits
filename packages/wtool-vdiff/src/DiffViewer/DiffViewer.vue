<template>
  <div class="diff-viewer-wrap">
    <TopBar class="top-bar" :diffPair="diffPair" />
    <div class="content-wrap" v-show="!viewed" v-loading="loading">
      <MonacoDiffViewer
        class="monaco-container"
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
import { ref, computed } from 'vue'

import { loadingDirective } from '@yuhufe/web-ui'
import type { DiffEditorOptions, WtoolDiffViewerProps, ModelOptions } from '../types'
import MonacoDiffViewer from './MonacoDiffViewer.vue'
import TopBar from './TopBar.vue'
import { useDiffViewer } from './useDiffView'
import { patch2Pair } from './utils/patch2Pair'

const vLoading = loadingDirective
const loading = ref(true)

const _renderStart = performance.now()
const onMonacoRenderComplete = () => {
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
  width: '100%',
  height: '400px',
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

const originalCode = computed(() => diffPair.value[0].content)
const modifiedCode = computed(() => diffPair.value[1].content)

const { funcs, registerFunc } = useDiffViewer({ isMaster: true })

/** raw 勾选时展示全文；未勾选时折叠无变更块，仅保留差异附近的上下文行 */
const mergedOptions = computed(() => {
  // 折叠上下文
  let hideUnchangedRegions = props.options.hideUnchangedRegions || {}
  if (rawed.value) {
    hideUnchangedRegions = {
      enabled: false,
      ...hideUnchangedRegions,
    }
  } else {
    hideUnchangedRegions = {
      enabled: true,
      contextLineCount: 5,
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

registerFunc({
  viewed,
  rawed,
})
</script>

<style scoped>
.diff-viewer-wrap {
  border: 1px solid #ddd;

  .top-bar {
    flex-shrink: 0;
  }
  .content-wrap {
    height: 250px;
    overflow: hidden;
  }
}
</style>
