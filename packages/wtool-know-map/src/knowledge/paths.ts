import type { KnowledgeData, MapEntry } from './types'
export function createIndex(data: KnowledgeData) {
  const entryById = new Map(data.entries.map(e => [e.id, e]))
  const entityById = new Map(data.entities.map(e => [e.id, e]))
  const childrenByParentId = new Map<string, MapEntry[]>()
  const entryIdsByEntityId = new Map<string, string[]>()
  for (const entry of data.entries) {
    if (entry.parentId)
      childrenByParentId.set(entry.parentId, [...(childrenByParentId.get(entry.parentId) ?? []), entry])
    if (entry.entityId)
      entryIdsByEntityId.set(entry.entityId, [...(entryIdsByEntityId.get(entry.entityId) ?? []), entry.id])
  }
  for (const children of childrenByParentId.values())
    children.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
  const ancestorIdsByEntryId = new Map<string, string[]>()
  const fullPaths = new Map<string, string>()
  const searchPaths = new Map<string, string>()
  for (const entry of data.entries) {
    const path: MapEntry[] = []
    const seen = new Set([entry.id])
    let parent = entry.parentId && entryById.get(entry.parentId)
    while (parent && !seen.has(parent.id)) {
      path.unshift(parent)
      seen.add(parent.id)
      parent = parent.parentId && entryById.get(parent.parentId)
    }
    ancestorIdsByEntryId.set(
      entry.id,
      path.map(e => e.id)
    )
    fullPaths.set(entry.id, [...path, entry].map(e => e.label).join(' → '))
    searchPaths.set(
      entry.id,
      [...path, entry]
        .filter(e => e.kind !== 'root' && (!e.compactInSearchPath || e.id === entry.id))
        .map(e => e.searchLabel ?? e.label)
        .join(' → ')
    )
  }
  const layoutByParentId = new Map(data.layoutGroups.map(g => [g.parentEntryId, g]))
  return {
    entryById,
    entityById,
    childrenByParentId,
    entryIdsByEntityId,
    ancestorIdsByEntryId,
    fullPaths,
    searchPaths,
    layoutByParentId,
  }
}
export type KnowledgeIndex = ReturnType<typeof createIndex>
export function searchEntries(index: KnowledgeIndex, input: string) {
  const query = input.trim().toLocaleLowerCase()
  if (!query) return []
  return [...index.entryById.values()]
    .filter(e => e.kind !== 'root')
    .map(entry => {
      const entity = entry.entityId ? index.entityById.get(entry.entityId) : undefined
      const names = [entry.label, entry.searchLabel ?? '', ...(entity?.aliases ?? [])].map(s => s.toLocaleLowerCase())
      const score = names.includes(query)
        ? 0
        : names.some(n => n.startsWith(query))
        ? 1
        : names.some(n => n.includes(query))
        ? 2
        : `${index.fullPaths.get(entry.id)} ${entity?.summary ?? ''}`.toLocaleLowerCase().includes(query)
        ? 3
        : 4
      return { entry, entity, score, path: index.searchPaths.get(entry.id)!, fullPath: index.fullPaths.get(entry.id)! }
    })
    .filter(r => r.score < 4)
    .sort((a, b) => a.score - b.score || a.path.localeCompare(b.path, 'zh-CN') || a.entry.id.localeCompare(b.entry.id))
}
