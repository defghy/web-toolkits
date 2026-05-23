<template>
  <div class="file-explore-wrap"></div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, shallowRef } from 'vue'

import { loadingDirective } from '@yuhufe/web-ui'
import type { FileTree, WtoolDiffViewerProps, ModelOptions } from '@/types'

const props = withDefaults(
  defineProps<{
    diffFiles: WtoolDiffViewerProps[]
  }>(),
  {
    diffFiles: () => [],
  }
)

const filesData = shallowRef<FileTree[]>([])
</script>

<style scoped></style>
