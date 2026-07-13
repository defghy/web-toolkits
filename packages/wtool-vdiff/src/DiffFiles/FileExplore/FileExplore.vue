<template>
  <div class="file-explore-wrap">
    <VTree
      ref="treeRef"
      selectable
      enable-leaf-only
      :unselect-on-click="false"
      :default-expand-all="true"
      :animation="false"
      :node-min-height="32"
      :node-indent="8"
      :render-node-amount="60"
      :buffer-node-amount="20"
      empty-text="No changed files"
      @click="handleNodeClick"
      @selected-change="handleSelectedChange"
    >
      <template #node="{ node }">
        <div class="file-tree-node" :title="node.fullPath || node.title">
          <img class="file-tree-node__icon" :src="node.isDirectory ? folderIcon : fileIcon" alt="" />
          <span class="file-tree-node__label">{{ node.title }}</span>
        </div>
      </template>
    </VTree>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import VTree, { type TreeNode } from '@wsfe/vue-tree'
import '@wsfe/vue-tree/style.css'

import fileIcon from '@/assets/file.svg'
import folderIcon from '@/assets/folder.svg'
import type { FileTree } from '@/types'
import { buildDiffFileTree, type DiffFileSelection, type FileItem } from './fileTree'

const props = withDefaults(
  defineProps<{
    diffFiles: FileItem[]
  }>(),
  {
    diffFiles: () => [],
  }
)

const emit = defineEmits<{
  'select-file': [selection: DiffFileSelection]
}>()

type VTreeInstance = InstanceType<typeof VTree>
type RenderedTreeNode = TreeNode & FileTree

const treeRef = ref<VTreeInstance | null>(null)
const filesData = shallowRef<FileTree[]>([])

const loadTreeData = async () => {
  filesData.value = buildDiffFileTree(props.diffFiles)

  await nextTick()
  treeRef.value?.clearSelected()
  treeRef.value?.setData(filesData.value)
}

const handleNodeClick = (node: RenderedTreeNode) => {
  if (!node.isDirectory) return
  treeRef.value?.setExpand(node.id, !node.expand, false)
}

const handleSelectedChange = (node: RenderedTreeNode | null) => {
  if (!node || node?.isDirectory) return

  emit('select-file', {
    fullPath: node.fullPath,
  })
}

onMounted(() => {
  loadTreeData()
})
</script>

<style lang="less" scoped>
.file-explore-wrap {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.file-tree {
  width: 100%;
  height: 100%;
  color: #252a31;
  font-size: 13px;
}

.file-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding-right: 8px;
  box-sizing: border-box;
  font-size: 14px;

  .file-tree-node__icon {
    width: 16px;
    height: 16px;
    margin-right: 7px;
    flex: 0 0 16px;
  }

  .file-tree-node__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.file-explore-wrap {
  :deep(.vtree-tree__wrapper) {
    .vtree-tree-node__title {
      min-width: 0;
      flex: 1;
      overflow: hidden;
      cursor: pointer;
      margin-left: 0;
      padding-left: 2px;
    }

    .vtree-tree-node__title_selected {
      color: #1261a6;
      background: #e7f2fc;
    }

    .vtree-tree__empty-text_default {
      color: #747b85;
      font-size: 13px;
    }

    .vtree-tree__scroll-area {
      scrollbar-width: thin;
    }
  }
}
</style>
