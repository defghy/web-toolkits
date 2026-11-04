import { describe, expect, it } from 'vitest'
import { index } from '../knowledge'
import { revealEntry, toggleBranch, treeChildren, visibleTree, type TreeState } from '../map/tree'

const initial = (): TreeState => ({ expanded: new Set(), selected: null, active: 'frontend' })

describe('知识树浏览', () => {
  it('全部收起时仅展示职责，每个节点一行', () => {
    const rows = visibleTree(index, new Set())
    expect(rows.map(row => row.entry.id)).toEqual(treeChildren(index, 'root').map(entry => entry.id))
    expect(rows.every(row => row.depth === 0)).toBe(true)
  })
  it('只展开直接子项，收起后恢复其他分支的顺序', () => {
    let state = toggleBranch(index, initial(), 'frontend')
    expect(
      visibleTree(index, state.expanded)
        .map(row => row.entry.id)
        .slice(0, 4)
    ).toEqual(['frontend', 'interface', 'client', 'ingress'])
    state = toggleBranch(index, state, 'interface')
    expect(visibleTree(index, state.expanded).some(row => row.entry.id === 'platform')).toBe(true)
    state = toggleBranch(index, state, 'frontend')
    expect(state.expanded.size).toBe(0)
    expect(visibleTree(index, state.expanded)).toEqual(visibleTree(index, new Set()))
  })
  it('搜索展开完整祖先路径，不隔离其他职责', () => {
    const state = revealEntry(index, initial(), 'ui/vue')
    const rows = visibleTree(index, state.expanded)
    const target = rows.find(row => row.entry.id === 'ui/vue')!
    expect(target.depth).toBe(5)
    expect(state.selected).toBe('ui/vue')
    expect(state.active).toBe('ui/vue')
    expect(rows.some(row => row.entry.id === 'infrastructure')).toBe(true)
    for (const id of ['frontend', 'interface', 'platform', 'web', 'ui']) expect(state.expanded.has(id)).toBe(true)
  })
  it('有序职责和数据阶段在树中保持配置顺序', () => {
    expect(treeChildren(index, 'frontend').map(entry => entry.id)).toEqual(['interface', 'client'])
    expect(treeChildren(index, 'data').map(entry => entry.id)).toEqual(['cache', 'persistence', 'other-data'])
  })
  it('同一实体的不同入口独立定位，连续定位保留最后目标', () => {
    let state = revealEntry(index, initial(), 'cache/redis')
    state = revealEntry(index, state, 'key-value/redis')
    expect(state.selected).toBe('key-value/redis')
    expect(visibleTree(index, state.expanded).some(row => row.entry.id === 'key-value/redis')).toBe(true)
    expect(state.expanded.has('cache')).toBe(true)
  })
  it('收起父分类清理后代状态，不影响展开的兄弟职责', () => {
    let state = revealEntry(index, initial(), 'ui/vue')
    state = toggleBranch(index, state, 'backend')
    state = toggleBranch(index, state, 'frontend')
    expect(state.selected).toBeNull()
    expect(state.active).toBe('frontend')
    expect([...state.expanded]).toEqual(['backend'])
  })
  it('无效 ID 和根节点定位不破坏当前状态', () => {
    const state = initial()
    expect(revealEntry(index, state, 'removed')).toBe(state)
    expect(revealEntry(index, state, 'root')).toBe(state)
    expect(toggleBranch(index, state, 'ui/vue')).toBe(state)
  })
  it('行数据包含完整的树形与无障碍层级信息', () => {
    const state = revealEntry(index, initial(), 'ui/vue')
    const rows = visibleTree(index, state.expanded)
    const vue = rows.find(row => row.entry.id === 'ui/vue')!
    expect(vue.guides).toHaveLength(vue.depth)
    expect(vue.siblingCount).toBe(3)
    expect(vue.siblingIndex).toBe(0)
    expect(vue.last).toBe(false)
    expect(rows.find(row => row.entry.id === 'ui/angular')?.last).toBe(true)
  })
  it('最后一个分支的下级不延续已结束的祖先连接线', () => {
    const state = revealEntry(index, initial(), 'routing/router')
    const rows = visibleTree(index, state.expanded)
    expect(rows.find(row => row.entry.id === 'routing')?.guides[0]).toBe(false)
  })
})
