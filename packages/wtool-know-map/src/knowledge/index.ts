import { entities } from './entities'
import { entries } from './entries'
import { layoutGroups } from './layout-groups'
import { relations } from './relations'
import { createIndex } from './paths'
import type { KnowledgeData } from './types'
export const knowledge: KnowledgeData = { version: '2026-11-04.1', entities, entries, layoutGroups, relations }
export const index = createIndex(knowledge)
