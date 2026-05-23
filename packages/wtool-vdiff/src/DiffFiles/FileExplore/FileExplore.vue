<template>
  <div class="file-explore-wrap"></div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

import { loadingDirective } from '@yuhufe/web-ui'
import type { DiffEditorOptions, WtoolDiffViewerProps, ModelOptions } from '@/types'

const props = withDefaults(
  defineProps<{
    diffFiles: WtoolDiffViewerProps[]
  }>(),
  {
    diffFiles: () => [],
  }
)
</script>

<style scoped></style>
