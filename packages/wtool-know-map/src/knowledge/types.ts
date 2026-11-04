export interface TechEntity {
  id: string
  name: string
  aliases: string[]
  kind: string
  summary: string
  sources: { title: string; url: string; checkedAt: string }[]
}
export interface MapEntry {
  id: string
  parentId?: string
  label: string
  kind: 'root' | 'domain' | 'dimension' | 'function' | 'approach' | 'technology'
  entityId?: string
  classificationBasis?: string
  searchLabel?: string
  compactInSearchPath?: boolean
  order: number
}
export interface LayoutGroup {
  id: string
  parentEntryId: string
  mode: 'product-layers' | 'ordered-stages' | 'treemap'
  orderedEntryIds: string[]
  auxiliaryEntryIds?: string[]
  context?: string
}
export interface TechRelation {
  id: string
  source: { kind: 'entry' | 'entity'; id: string }
  target: { kind: 'entry' | 'entity'; id: string }
  type: 'calls' | 'reads-from' | 'derived-from' | 'runs-on' | 'managed-by' | 'uses-language' | 'integrates-with'
  description: string
  context: string
}
export interface KnowledgeData {
  version: string
  entities: TechEntity[]
  entries: MapEntry[]
  layoutGroups: LayoutGroup[]
  relations: TechRelation[]
}
