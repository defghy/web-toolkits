<template>
  <div class="top-bar-wrap" :style="{ height: `${HEIGHT_TOP_BAR}px` }">
    <div class="title-area">
      <div class="filename">{{ filenameDisplay }}</div>
      <span :class="['diff-type-tag', diffType]">{{ diffTypeLabel }}</span>
      <div class="diff-line-num">
        <div class="add" v-if="diffType !== 'del'">+{{ changed.added }}</div>
        <div class="del" v-if="diffType !== 'add'">-{{ changed.removed }}</div>
      </div>
    </div>
    <div class="toolbar">
      <label>
        <input type="checkbox" :checked="viewed" @change="onViewedChange" />
        viewed
      </label>
      <label v-if="canUnchangeVisible">
        <input type="checkbox" :checked="rawed" @change="onRawedChange" />
        raw
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDiffViewer } from './useDiffView'
import { HEIGHT_TOP_BAR } from './const'

const { funcs, registerFunc } = useDiffViewer()

const props = withDefaults(
  defineProps<{
    diffPair?: { filename: string; content: string | null }[]
  }>(),
  {
    diffPair: () => [],
  }
)

type DiffType = 'changed' | 'add' | 'del' | 'rename'

const diffType = computed<DiffType>(() => {
  const [original, modified] = props.diffPair
  if (!original || !modified) return 'changed'

  const originalNull = original.content === null
  const modifiedNull = modified.content === null

  if (originalNull && !modifiedNull) return 'add'
  if (!originalNull && modifiedNull) return 'del'
  if (original.filename !== modified.filename) return 'rename'
  return 'changed'
})

const diffTypeLabel = computed(() => {
  const map: Record<DiffType, string> = {
    changed: 'changed',
    add: 'added',
    del: 'deleted',
    rename: 'renamed',
  }
  return map[diffType.value]
})

const filenameDisplay = computed(() => {
  const [original, modified] = props.diffPair
  if (!original) return ''
  if (diffType.value === 'rename') {
    return `${original.filename} → ${modified.filename}`
  }
  return original.filename
})

const { viewed, rawed, canUnchangeVisible } = funcs
const onViewedChange = function (evt) {
  const checked = (evt.target as HTMLInputElement).checked
  funcs.updateViewed(checked)
}
const onRawedChange = function (evt) {
  const checked = (evt.target as HTMLInputElement).checked
  funcs.updateRawed(checked)
}

onMounted(() => {
  // funcs.options.toolbar?.render($el, {})
})

// 变更行数
const changed = ref({ added: 0, removed: 0 })
function updateChangedLines(newVal) {
  Object.assign(changed.value, newVal)
}

registerFunc({
  viewed,
  rawed,
  updateChangedLines,
})
</script>

<style scoped>
.top-bar-wrap {
  box-sizing: border-box;

  display: flex;
  overflow: hidden;
  align-items: center;
  background-color: #f7f7f7;
  padding: 4px 8px;

  .title-area {
    flex: 1;
    display: flex;
    align-items: center;
    overflow: hidden;

    .filename {
      font-size: 14px;
      line-height: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .diff-line-num {
      flex-shrink: 0;
      display: inline-flex;
      font-size: 12px;
      font-weight: bold;
      margin-left: 4px;
      .add {
        color: #1a7f37;
      }
      .del {
        color: #d1242f;
        margin-left: 4px;
      }
    }
  }
  .toolbar {
    font-size: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;

    label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      margin-right: 4px;

      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      input {
        margin-right: 2px;
      }
    }
  }
}

.diff-type-tag {
  flex-shrink: 0;
  display: block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;

  &.changed {
    background-color: #ddf4ff;
    color: #0969da;
  }
  &.add {
    background-color: #dafbe1;
    color: #1a7f37;
  }
  &.del {
    background-color: #ffebe9;
    color: #d1242f;
  }
  &.rename {
    background-color: #fff8c5;
    color: #9a6700;
  }
}
</style>
