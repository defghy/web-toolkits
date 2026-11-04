import type { LayoutGroup } from './types'
export const layoutGroups: LayoutGroup[] = [
  {
    id: 'product',
    parentEntryId: 'root',
    mode: 'product-layers',
    orderedEntryIds: ['frontend', 'ingress', 'backend', 'data', 'runtime', 'deployment', 'os', 'infrastructure'],
    auxiliaryEntryIds: ['support'],
    context: '从面向用户的职责到运行基础的浏览顺序，不是请求必须经过的步骤。',
  },
  {
    id: 'frontend-stages',
    parentEntryId: 'frontend',
    mode: 'ordered-stages',
    orderedEntryIds: ['interface', 'client'],
    context: '从界面呈现深入到客户端应用逻辑。',
  },
  {
    id: 'backend-stages',
    parentEntryId: 'backend',
    mode: 'ordered-stages',
    orderedEntryIds: ['business', 'collaboration', 'access'],
    context: '从业务职责深入到协作及数据访问；消息和异步任务是可选分支。',
  },
  {
    id: 'data-stages',
    parentEntryId: 'data',
    mode: 'ordered-stages',
    orderedEntryIds: ['cache', 'persistence'],
    auxiliaryEntryIds: ['other-data'],
    context: '数据库作为持久数据源、缓存加速读取的场景。缓存命中时无需查询数据库；其他能力是独立分支。',
  },
]
