<template>
  <div class="diff-viewer-wrap">
    <TopBar class="top-bar" :diffPair="diffPair" />
    <div class="content-wrap" v-show="!viewed">
      <MonacoDiffViewer
        class="monaco-container"
        :originalCode="originalCode"
        :modifiedCode="modifiedCode"
        :language="language"
        :options="mergedOptions"
        :modelOptions="modelOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'

import type { DiffEditorOptions, ModelOptions } from './props'
import MonacoDiffViewer from './MonacoDiffViewer.vue'
import TopBar from './TopBar.vue'
import { useDiffViewer } from './useDiffView'

const props = withDefaults(
  defineProps<{
    diffPair?: { filename: string; content: string }[]
    diffPatch?: string
    language?: string
    options?: DiffEditorOptions
    modelOptions?: ModelOptions
    width?: string
    height?: string
  }>(),
  {
    diffPair: () => [],
    diffPatch: '',
    language: 'plaintext',
    options: () => ({}),
    modelOptions: () => ({}),
    width: '100%',
    height: '400px',
  }
)

const originalCode = computed(() => props.diffPair[0].content)
const modifiedCode = computed(() => props.diffPair[1].content)

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
      contextLineCount: 3,
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
// 由 MonacoDiffViewer 在首次 diff 完成后写入，TopBar 通过 funcs 读取展示
const changedLines = ref<{ added: number; removed: number }>({ added: 0, removed: 0 })

registerFunc({
  viewed,
  rawed,
  changedLines,
  updateChangedLines: (args: { added: number; removed: number }) => {
    changedLines.value = args
  },
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
