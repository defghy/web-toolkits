import type { KnowledgeData } from './types'
export function validateKnowledge(data: KnowledgeData): string[] {
  const errors: string[] = []
  function unique(ids: string[], label: string) {
    if (new Set(ids).size !== ids.length) errors.push(`${label} ID 重复`)
  }
  unique(
    data.entries.map(e => e.id),
    '展示条目'
  )
  unique(
    data.entities.map(e => e.id),
    '实体'
  )
  unique(
    data.layoutGroups.map(e => e.id),
    '布局'
  )
  unique(
    data.relations.map(e => e.id),
    '关系'
  )
  const entries = new Map(data.entries.map(e => [e.id, e]))
  const entities = new Set(data.entities.map(e => e.id))
  const roots = data.entries.filter(e => !e.parentId)
  if (roots.length !== 1 || roots[0]?.kind !== 'root') errors.push('必须恰有一个根节点')
  for (const e of data.entries) {
    if (!e.label.trim() || !Number.isFinite(e.order)) errors.push(`条目字段无效: ${e.id}`)
    if (e.parentId && !entries.has(e.parentId)) errors.push(`父节点无效: ${e.id}`)
    if ((e.kind === 'technology' && !e.entityId) || (e.entityId && !entities.has(e.entityId)))
      errors.push(`实体引用无效: ${e.id}`)
    if (e.kind === 'technology' && data.entries.some(c => c.parentId === e.id))
      errors.push(`技术条目不可有分类子项: ${e.id}`)
    if (e.compactInSearchPath && !['dimension', 'function'].includes(e.kind)) errors.push(`不可省略核心路径: ${e.id}`)
    const seen = new Set<string>()
    let current: typeof e | undefined = e
    while (current) {
      if (seen.has(current.id)) {
        errors.push(`分类树有环: ${e.id}`)
        break
      }
      seen.add(current.id)
      current = current.parentId ? entries.get(current.parentId) : undefined
    }
  }
  unique(
    data.layoutGroups.map(g => g.parentEntryId),
    '布局父节点'
  )
  for (const g of data.layoutGroups) {
    const ids = [...g.orderedEntryIds, ...(g.auxiliaryEntryIds ?? [])]
    const children = data.entries.filter(e => e.parentId === g.parentEntryId).map(e => e.id)
    if (!entries.has(g.parentEntryId)) errors.push(`布局父节点无效: ${g.id}`)
    if (new Set(ids).size !== ids.length || ids.length !== children.length || children.some(id => !ids.includes(id)))
      errors.push(`布局必须互斥覆盖直接子项: ${g.id}`)
    if (g.mode !== 'treemap' && !g.context?.trim()) errors.push(`有序布局缺少场景: ${g.id}`)
  }
  for (const r of data.relations) {
    for (const end of [r.source, r.target])
      if (!(end.kind === 'entry' ? entries.has(end.id) : entities.has(end.id))) errors.push(`关系端点无效: ${r.id}`)
    if (!r.context.trim() || !r.description.trim()) errors.push(`关系缺少场景或描述: ${r.id}`)
  }
  for (const e of data.entities) {
    if (!e.summary || !e.kind || !e.sources.length) errors.push(`实体资料不完整: ${e.id}`)
    for (const s of e.sources) {
      try {
        if (new URL(s.url).protocol !== 'https:') errors.push(`资料链接必须为 HTTPS: ${e.id}`)
      } catch {
        errors.push(`资料 URL 无效: ${e.id}`)
      }
      if (s.checkedAt && !/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt)) errors.push(`核验日期无效: ${e.id}`)
    }
  }
  return errors
}
