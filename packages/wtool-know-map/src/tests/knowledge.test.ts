import { describe, it, expect } from 'vitest'
import { index, knowledge } from '../knowledge'
import { createIndex, searchEntries } from '../knowledge/paths'
import { validateKnowledge } from '../knowledge/validate'

describe('知识数据与路径', () => {
  it('数据树、布局和关系引用完整有效', () => expect(validateKnowledge(knowledge)).toEqual([]))
  it('检测环、重复 ID、缺失实体以及错误布局覆盖', () => {
    const data = structuredClone(knowledge)
    data.entries.find(e => e.id === 'frontend')!.parentId = 'web'
    data.entries.push({ ...data.entries[0] })
    data.entries.find(e => e.id === 'ui/vue')!.entityId = 'missing'
    data.layoutGroups[0].auxiliaryEntryIds = ['frontend']
    const errors = validateKnowledge(data).join('\n')
    expect(errors).toContain('有环')
    expect(errors).toContain('重复')
    expect(errors).toContain('实体引用')
    expect(errors).toContain('互斥覆盖')
  })
  it('保留共享实体的不同分类路径和资料', () => {
    for (const entity of ['redis', 'sqlite', 'cesium'])
      expect(index.entryIdsByEntityId.get(entity)!.length).toBeGreaterThan(1)
    const redis = searchEntries(index, 'Redis').filter(r => r.score === 0)
    expect(redis).toHaveLength(2)
    expect(redis.map(r => r.path).join('\n')).toContain('非关系型 → 键值 → Redis')
    expect(redis[0].entity).toBe(redis[1].entity)
  })
  it('Vue 短路径与完整路径同时可用，支持别名与中文能力', () => {
    const vue = searchEntries(index, 'Vue')[0]
    expect(vue.path).toBe('前端 → Web 端 → Vue')
    expect(vue.fullPath).toContain('UI 库 / 框架 → Vue')
    expect(searchEntries(index, 'k8s')[0].entity?.id).toBe('kubernetes')
    expect(searchEntries(index, 'rn')[0].entity?.id).toBe('rn')
    expect(searchEntries(index, '地理').some(r => r.entry.id === 'gis')).toBe(true)
    expect(searchEntries(index, '   ')).toEqual([])
  })
  it('精确、前缀、包含结果依次排列且排序稳定', () => {
    const results = searchEntries(index, 'Vue')
    expect(results.map(r => r.score)).toEqual([...results.map(r => r.score)].sort())
    expect(searchEntries(index, 'Vue')).toEqual(results)
  })
  it('缓存来源、语言环境、容器运行与编排关系分开建模', () => {
    expect(knowledge.relations.find(r => r.id === 'cache-source')).toMatchObject({
      source: { id: 'cache' },
      target: { id: 'database' },
      type: 'derived-from',
    })
    expect(knowledge.relations.find(r => r.id === 'app-node')).toMatchObject({
      type: 'runs-on',
      target: { id: 'node' },
    })
    expect(knowledge.relations.find(r => r.id === 'container-linux')).toMatchObject({
      type: 'runs-on',
      target: { id: 'linux' },
    })
    expect(knowledge.relations.find(r => r.id === 'container-management')).toMatchObject({
      type: 'managed-by',
      target: { id: 'kubernetes' },
    })
    expect(index.ancestorIdsByEntryId.get('containers/docker')).toContain('deployment')
  })
  it('路径索引对无效树终止，而不陷入循环', () => {
    const data = structuredClone(knowledge)
    data.entries[0].parentId = 'ui'
    expect(createIndex(data).ancestorIdsByEntryId.size).toBe(data.entries.length)
  })
})
