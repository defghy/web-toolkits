import type { KnowledgeIndex } from '../knowledge/paths'
import type { MapEntry } from '../knowledge/types'

export interface TreeState {
  expanded: Set<string>
  selected: string | null
  active: string
}

export interface TreeRow {
  entry: MapEntry
  depth: number
  last: boolean
  guides: boolean[]
  siblingIndex: number
  siblingCount: number
}

/** 有序阶段仍遵循知识数据配置，辅助分类作为同级分支展示。 */
export function treeChildren(index: KnowledgeIndex, parentId: string): MapEntry[] {
  const children = index.childrenByParentId.get(parentId) ?? []
  const group = index.layoutByParentId.get(parentId)
  if (!group || group.mode === 'treemap') return children
  return [...group.orderedEntryIds, ...(group.auxiliaryEntryIds ?? [])]
    .map(id => index.entryById.get(id))
    .filter((entry): entry is MapEntry => !!entry)
}

export function visibleTree(index: KnowledgeIndex, expanded: ReadonlySet<string>): TreeRow[] {
  const rows: TreeRow[] = []
  function visit(parentId: string, depth: number, guides: boolean[]) {
    const children = treeChildren(index, parentId)
    children.forEach((entry, siblingIndex) => {
      const last = siblingIndex === children.length - 1
      const rowGuides = depth === 0 ? [] : [...guides, !last]
      rows.push({ entry, depth, last, guides: rowGuides, siblingIndex, siblingCount: children.length })
      if (expanded.has(entry.id)) visit(entry.id, depth + 1, rowGuides)
    })
  }
  visit('root', 0, [])
  return rows
}

export function revealEntry(index: KnowledgeIndex, state: TreeState, id: string): TreeState {
  if (!index.entryById.has(id) || id === 'root') return state
  const expanded = new Set(state.expanded)
  for (const ancestor of index.ancestorIdsByEntryId.get(id) ?? []) {
    if (ancestor !== 'root') expanded.add(ancestor)
  }
  if (index.childrenByParentId.get(id)?.length) expanded.add(id)
  return { expanded, selected: id, active: id }
}

export function toggleBranch(index: KnowledgeIndex, state: TreeState, id: string): TreeState {
  if (!index.childrenByParentId.get(id)?.length) return state
  const expanded = new Set(state.expanded)
  let selected = state.selected
  if (expanded.has(id)) {
    expanded.delete(id)
    for (const child of expanded) {
      if (index.ancestorIdsByEntryId.get(child)?.includes(id)) expanded.delete(child)
    }
    if (selected && index.ancestorIdsByEntryId.get(selected)?.includes(id)) selected = null
  } else expanded.add(id)
  return { expanded, selected, active: id }
}
