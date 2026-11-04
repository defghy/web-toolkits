<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { index } from '../knowledge'
import { searchEntries } from '../knowledge/paths'
const emit = defineEmits<{ locate: [id: string] }>()
const query = shallowRef('')
const open = shallowRef(false)
const active = shallowRef(0)
const results = computed(() => searchEntries(index, query.value))
const candidates = computed(() => results.value.slice(0, 20))
const visible = computed(() => open.value && !!query.value.trim())
const list = useTemplateRef<HTMLDivElement>('list')
watch(query, () => {
  active.value = 0
  open.value = true
})
watch(active, async () => {
  await nextTick()
  list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
})
function choose(id: string) {
  emit('locate', id)
  open.value = false
  query.value = ''
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && visible.value) {
    event.stopPropagation()
    open.value = false
    event.preventDefault()
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    active.value =
      (active.value + (event.key === 'ArrowDown' ? 1 : -1) + Math.max(1, candidates.value.length)) %
      Math.max(1, candidates.value.length)
  }
  if (event.key === 'Enter' && visible.value && candidates.value[active.value]) {
    event.preventDefault()
    choose(candidates.value[active.value].entry.id)
  }
}
</script>

<template>
  <div
    class="search"
    @focusout="event => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) open=false }"
  >
    <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
    <input
      v-model="query"
      class="search-input"
      role="combobox"
      aria-label="搜索技术或职责"
      placeholder="搜索技术或职责，如 Vue、GIS、容器…"
      autocomplete="off"
      :aria-expanded="visible"
      aria-controls="search-results"
      :aria-activedescendant="visible && candidates.length ? 'result-' + active : undefined"
      @focus="open = true"
      @keydown="keydown"
    />
    <div v-if="visible" id="search-results" ref="list" class="suggestions" role="listbox" aria-label="技术路径候选">
      <p class="result-count" role="status">
        {{
          results.length
            ? `共 ${results.length} 条路径${results.length > 20 ? '，显示前 20 条' : ''}`
            : '没有匹配的技术或职责'
        }}
      </p>
      <div
        v-for="(result, i) in candidates"
        :id="'result-' + i"
        :key="result.entry.id"
        class="candidate"
        role="option"
        :aria-selected="active === i"
        :title="result.fullPath"
        @pointerdown.prevent="choose(result.entry.id)"
        @mousemove="active = i"
      >
        <div class="result-path">{{ result.path }}</div>
        <div class="result-description">
          {{ result.entity?.kind ?? result.entry.label }} ·
          {{ result.entity?.summary ?? result.entry.classificationBasis ?? '展开探索此职责下的分类' }}
        </div>
        <div class="full-path">{{ result.fullPath }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--page);
  padding: 12px 0 10px;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 26px;
  width: 19px;
  fill: none;
  stroke: #75847b;
  stroke-width: 1.7;
}
.search-input {
  display: block;
  width: 100%;
  height: 46px;
  border: 1px solid #d4dcd5;
  border-radius: 9px;
  background: #fff;
  padding: 0 16px 0 47px;
  font: inherit;
  font-size: 14px;
  color: var(--ink);
  outline: none;
  box-shadow: 0 2px 6px #24372b04;
}
.search-input:focus {
  border-color: #6f907a;
  box-shadow: 0 0 0 3px #75978214;
}
.suggestions {
  position: absolute;
  left: 0;
  right: 0;
  top: 64px;
  max-height: min(70vh, 650px);
  overflow: auto;
  background: #fff;
  border: 1px solid #d5ded7;
  border-radius: 10px;
  box-shadow: 0 12px 40px #203a2520;
}
.result-count {
  font-size: 12px;
  color: #6e7c72;
  padding: 12px 16px;
  margin: 0;
  border-bottom: 1px solid #edf0ed;
}
.candidate {
  padding: 11px 16px;
  cursor: pointer;
  border-bottom: 1px solid #edf0ed;
}
.candidate[aria-selected='true'] {
  background: #edf4ed;
}
.result-path {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}
.result-description {
  font-size: 12px;
  color: #657469;
  margin-top: 3px;
}
.full-path {
  font-size: 11px;
  color: #849087;
  margin-top: 5px;
  line-height: 1.5;
}
</style>
