import { onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { index, knowledge } from '../knowledge'
import { revealEntry, toggleBranch, type TreeState } from '../map/tree'

const STORAGE_KEY = 'know-map:tree:depth-2'
const firstEntry = index.childrenByParentId.get('root')?.[0]?.id ?? 'root'

function readState(): TreeState {
  const expanded = new Set(
    (index.childrenByParentId.get('root') ?? [])
      .filter(entry => index.childrenByParentId.has(entry.id))
      .map(entry => entry.id)
  )
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved?.version === knowledge.version && Array.isArray(saved.expanded)) {
      expanded.clear()
      for (const id of saved.expanded) {
        if (index.childrenByParentId.has(id) && id !== 'root') expanded.add(id)
      }
    }
  } catch {
    // 禁用或损坏的存储不影响浏览。
  }
  const initial: TreeState = { expanded, selected: null, active: firstEntry }
  const params = new URLSearchParams(location.hash.slice(1))
  const target = params.get('selected') ?? params.get('focus')
  return target ? revealEntry(index, initial, target) : initial
}

export function useKnowledgeTree() {
  const state = shallowRef(readState())
  function locate(id: string) {
    state.value = revealEntry(index, state.value, id)
  }
  function toggle(id: string) {
    state.value = toggleBranch(index, state.value, id)
  }
  function activate(id: string) {
    if (index.childrenByParentId.get(id)?.length) toggle(id)
    else state.value = { ...state.value, active: id, selected: state.value.selected === id ? null : id }
  }
  function setActive(id: string) {
    if (state.value.active !== id) state.value = { ...state.value, active: id }
  }
  function escape() {
    if (state.value.selected) state.value = { ...state.value, selected: null }
    else {
      const active = state.value.active
      if (state.value.expanded.has(active)) toggle(active)
      else {
        const parent = index.entryById.get(active)?.parentId
        if (parent && parent !== 'root') toggle(parent)
      }
    }
  }
  function hashchange() {
    state.value = readState()
  }
  watch(state, current => {
    const params = new URLSearchParams()
    if (current.selected) params.set('selected', current.selected)
    try {
      history.replaceState(null, '', `${location.pathname}${location.search}${params.size ? '#' + params : ''}`)
    } catch {
      // 部分嵌入式宿主不允许更改 URL。
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: knowledge.version, expanded: [...current.expanded] }))
    } catch {
      // 存储不可用时保留内存中的交互状态。
    }
  })
  onMounted(() => window.addEventListener('hashchange', hashchange))
  onUnmounted(() => window.removeEventListener('hashchange', hashchange))
  return { state, locate, toggle, activate, setActive, escape }
}
