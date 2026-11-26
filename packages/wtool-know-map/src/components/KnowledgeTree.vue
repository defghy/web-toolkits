<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue'
import { index } from '../knowledge'
import { visibleTree, type TreeState } from '../map/tree'
import NodeDetails from './NodeDetails.vue'

const props = defineProps<{ state: TreeState }>()
const emit = defineEmits<{
  activate: [id: string]
  toggle: [id: string]
  locate: [id: string]
  active: [id: string]
}>()
const host = useTemplateRef<HTMLElement>('host')
const rows = computed(() => visibleTree(index, props.state.expanded))
const hasChildren = (id: string) => !!index.childrenByParentId.get(id)?.length
const entryKind = (id?: string) => (id ? index.entityById.get(id)?.kind : undefined)

function keydown(event: KeyboardEvent, id: string) {
  if (event.target !== event.currentTarget) return
  const position = rows.value.findIndex(row => row.entry.id === id)
  let target: string | undefined
  switch (event.key) {
    case 'ArrowDown':
      target = rows.value[position + 1]?.entry.id
      break
    case 'ArrowUp':
      target = rows.value[position - 1]?.entry.id
      break
    case 'Home':
      target = rows.value[0]?.entry.id
      break
    case 'End':
      target = rows.value.at(-1)?.entry.id
      break
    case 'ArrowRight':
      if (hasChildren(id)) {
        if (!props.state.expanded.has(id)) emit('toggle', id)
        else target = rows.value[position + 1]?.entry.id
      }
      break
    case 'ArrowLeft':
      if (props.state.expanded.has(id)) emit('toggle', id)
      else {
        const parent = index.entryById.get(id)?.parentId
        if (parent !== 'root') target = parent
      }
      break
    case 'Enter':
    case ' ':
      emit('activate', id)
      break
    default:
      return
  }
  event.preventDefault()
  event.stopPropagation()
  if (target) emit('active', target)
}

let operation = 0
async function focusEntry(id: string, focus: boolean) {
  const current = ++operation
  await nextTick()
  if (current !== operation) return
  const item = host.value?.querySelector(`[data-entry="${CSS.escape(id)}"]`) as HTMLElement | null
  if (!item) return
  if (focus) item.focus({ preventScroll: true })
  const row = item.querySelector('.tree-row') ?? item
  const rect = row.getBoundingClientRect()
  if (rect.top < 76 || rect.bottom > window.innerHeight - 16) row.scrollIntoView({ block: 'center' })
}
watch(
  () => [props.state.active, props.state.selected],
  () => focusEntry(props.state.active, true)
)
onMounted(() => {
  if (props.state.selected) focusEntry(props.state.selected, false)
})
</script>

<template>
  <main ref="host" class="tree-map" aria-label="互联网技术知识树">
    <ul class="tree" role="tree" aria-label="技术分类，使用上下方向键浏览，左右方向键展开收起">
      <li
        v-for="row in rows"
        :key="row.entry.id"
        :data-entry="row.entry.id"
        :class="['tree-item', { selected: state.selected === row.entry.id, domain: row.depth === 0 }]"
        :style="{ '--depth': row.depth }"
        role="treeitem"
        :aria-label="row.entry.label"
        :aria-level="row.depth + 1"
        :aria-posinset="row.siblingIndex + 1"
        :aria-setsize="row.siblingCount"
        :aria-expanded="hasChildren(row.entry.id) ? state.expanded.has(row.entry.id) : undefined"
        :aria-selected="state.selected === row.entry.id"
        :tabindex="state.active === row.entry.id ? 0 : -1"
        @focus.self="emit('active', row.entry.id)"
        @keydown="keydown($event, row.entry.id)"
      >
        <div class="tree-row" @click="emit('activate', row.entry.id)">
          <span
            v-for="(continues, level) in row.guides"
            :key="level"
            :class="[
              'tree-guide',
              { continues, elbow: level === row.depth - 1, last: row.last && level === row.depth - 1 },
            ]"
            :style="{ '--level': level }"
            aria-hidden="true"
          />
          <span
            :class="['node-icon', { open: state.expanded.has(row.entry.id), leaf: !hasChildren(row.entry.id) }]"
            aria-hidden="true"
          >
            <svg v-if="hasChildren(row.entry.id)" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4" /></svg>
            <span v-else class="leaf-dot" />
          </span>
          <span class="node-label">{{ row.entry.label }}</span>
          <span class="node-meta">
            {{
              hasChildren(row.entry.id)
                ? index.childrenByParentId.get(row.entry.id)?.length
                : entryKind(row.entry.entityId) ?? '待补充'
            }}
          </span>
        </div>
        <div v-if="state.selected === row.entry.id && !hasChildren(row.entry.id)" class="tree-details">
          <NodeDetails :entry-id="row.entry.id" @locate="emit('locate', $event)" />
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.tree-map {
  --indent: 22px;
  padding: 2px 0 20px;
}
.tree {
  list-style: none;
  padding: 4px;
  margin: 0;
  border: 1px solid #dce3dc;
  border-radius: 9px;
  background: #fff;
}
.tree-item {
  position: relative;
  outline: none;
  scroll-margin-top: 80px;
}
.tree-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 12px 6px calc(10px + var(--depth) * var(--indent));
  border-radius: 5px;
  cursor: pointer;
}
.tree-row:hover {
  background: #f3f6f1;
}
.tree-item:focus-visible > .tree-row {
  outline: 2px solid #73947d;
  outline-offset: -2px;
}
.selected > .tree-row {
  background: #e9f2e9;
  color: #285f45;
}
.domain > .tree-row {
  font-weight: 600;
}
.node-label {
  min-width: 0;
  font-size: 14px;
  line-height: 24px;
  overflow-wrap: anywhere;
}
.node-meta {
  margin-left: 4px;
  padding-left: 0;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 400;
  color: #849186;
}
.node-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6e8374;
}
.node-icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}
.node-icon.open svg {
  transform: rotate(90deg);
}
.leaf-dot {
  width: 4px;
  height: 4px;
  background: #9eaea1;
  border-radius: 50%;
}
.tree-guide {
  position: absolute;
  left: calc(18px + var(--level) * var(--indent));
  top: 0;
  bottom: 0;
  width: var(--indent);
  pointer-events: none;
}
.tree-guide.continues,
.tree-guide.elbow {
  border-left: 1px solid #e0e6df;
}
.tree-guide.elbow::after {
  content: '';
  position: absolute;
  top: 18px;
  width: 12px;
  border-top: 1px solid #e0e6df;
}
.tree-guide.last {
  bottom: auto;
  height: 18px;
}
.tree-details {
  margin: 0 12px 10px calc(30px + var(--depth) * var(--indent));
  padding: 8px 12px;
  border-left: 2px solid #c6d9c8;
  background: #f8faf6;
  border-radius: 0 6px 6px 0;
}
@media (max-width: 600px) {
  .tree-map {
    --indent: 14px;
  }
  .tree-row {
    min-height: 40px;
    gap: 5px;
    padding-right: 8px;
  }
  .tree-guide.elbow::after {
    top: 20px;
    width: 8px;
  }
  .tree-guide.last {
    height: 20px;
  }
  .tree-details {
    margin-left: calc(16px + var(--depth) * var(--indent));
    margin-right: 4px;
    padding: 8px;
  }
  .node-meta {
    font-size: 10px;
    padding-left: 4px;
  }
}
</style>
