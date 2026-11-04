import { entities } from './entities'
import type { MapEntry } from './types'
export const entries: MapEntry[] = [{ id: 'root', label: '互联网产品技术地图', kind: 'root', order: 0 }]
function group(
  id: string,
  parentId: string,
  label: string,
  kind: MapEntry['kind'] = 'function',
  extra: Partial<MapEntry> = {}
) {
  entries.push({ id, parentId, label, kind, order: entries.length, ...extra })
  return id
}
function techs(parentId: string, ids: string[]) {
  for (const entityId of ids) {
    const entity = entities.find(e => e.id === entityId)!
    entries.push({
      id: `${parentId}/${entityId}`,
      parentId,
      label: entity.name,
      kind: 'technology',
      entityId,
      order: entries.length,
    })
  }
}
const domain = (id: string, label: string, extra: Partial<MapEntry> = {}) => group(id, 'root', label, 'domain', extra)
domain('frontend', '前端与用户交互', { searchLabel: '前端' })
group('interface', 'frontend', '用户界面', 'function', { compactInSearchPath: true })
group('platform', 'interface', '平台与应用形态', 'dimension', {
  compactInSearchPath: true,
  classificationBasis: '按应用平台分类',
})
group('web', 'platform', 'Web 端')
group('ui', 'web', 'UI 库 / 框架', 'function', { compactInSearchPath: true })
techs('ui', ['vue', 'react', 'angular'])
group('app-framework', 'web', '应用框架')
techs('app-framework', ['nuxt', 'next'])
group('native', 'platform', '移动原生')
techs('native', ['android', 'swiftui'])
group('cross', 'platform', '桌面与跨平台')
techs('cross', ['electron', 'tauri', 'rn', 'flutter'])
group('mini', 'platform', '小程序')
techs('mini', ['mini'])
group('vehicle', 'platform', '车机与其他终端')
techs('vehicle', ['qt'])
group('specialty', 'interface', '专业能力', 'dimension', {
  compactInSearchPath: true,
  classificationBasis: '按专业能力分类，与终端平台交叉',
})
group('gis', 'specialty', 'GIS / 地理信息')
group('map-display', 'gis', '地图展示与交互')
techs('map-display', ['openlayers', 'leaflet', 'maplibre'])
group('geo-compute', 'gis', '地理计算')
techs('geo-compute', ['turf'])
group('geo-3d', 'gis', '三维地理场景')
techs('geo-3d', ['cesium'])
group('3d', 'specialty', '3D 渲染')
group('graphics-api', '3d', '图形 API')
techs('graphics-api', ['webgl', 'webgpu'])
group('3d-engine', '3d', '引擎与库')
techs('3d-engine', ['three', 'babylon', 'cesium'])
group('2d', 'specialty', 'Canvas / 2D 绘制')
group('2d-api', '2d', '图形 API')
techs('2d-api', ['canvas'])
group('2d-lib', '2d', '图形库')
techs('2d-lib', ['konva', 'fabric', 'pixi'])
group('charts', 'specialty', '图表与数据可视化')
techs('charts', ['echarts', 'd3', 'antv'])
group('media', 'specialty', '音视频与实时交互')
techs('media', ['webrtc'])
group('editor', 'specialty', '编辑器与富文本')
techs('editor', ['tiptap'])
group('foundations', 'interface', '基础技术')
techs('foundations', ['html', 'css', 'javascript', 'typescript'])
group('client', 'frontend', '客户端应用')
group('routing', 'client', '路由与状态')
techs('routing', ['router', 'pinia'])
group('local', 'client', '本地数据')
techs('local', ['indexeddb', 'http-cache'])
group('request', 'client', '网络请求')
techs('request', ['fetch'])
domain('ingress', '接入与流量')
group('edge', 'ingress', '边缘分发与域名')
techs('edge', ['cdn', 'dns'])
group('proxy', 'ingress', '代理与负载均衡')
techs('proxy', ['nginx', 'envoy'])
group('gateway', 'ingress', 'API 网关')
techs('gateway', ['kong'])
domain('backend', '后端与服务')
group('business', 'backend', '服务与业务')
group('api', 'business', 'BFF 与业务接口')
techs('api', ['nestjs', 'spring', 'fastapi', 'graphql'])
group('rules', 'business', '业务规则', 'function', {
  classificationBasis: '鉴权、订单、交易等规则由具体产品实现；这里不强制对应某个框架。',
})
group('collaboration', 'backend', '服务协作')
group('rpc', 'collaboration', '服务调用')
techs('rpc', ['grpc'])
group('messaging', 'collaboration', '消息与事件')
techs('messaging', ['rabbitmq', 'kafka'])
group('jobs', 'collaboration', '异步任务')
techs('jobs', ['bullmq'])
group('access', 'backend', '数据访问')
group('orm', 'access', '查询封装与 ORM')
techs('orm', ['prisma', 'typeorm'])
group('pool', 'access', '连接池')
techs('pool', ['pgpool'])
domain('data', '数据与存储')
group('cache', 'data', '缓存 · 读取加速')
techs('cache', ['redis', 'memcached'])
group('persistence', 'data', '持久化与存储', 'function', { compactInSearchPath: true })
group('database', 'persistence', '数据库')
group('data-model', 'database', '按数据模型', 'dimension', {
  compactInSearchPath: true,
  classificationBasis: '按数据组织模型分类',
})
group('relational', 'data-model', '关系型')
techs('relational', ['mysql', 'postgres', 'sqlite'])
group('non-relational', 'data-model', '非关系型')
group('document', 'non-relational', '文档')
techs('document', ['mongodb'])
group('key-value', 'non-relational', '键值')
techs('key-value', ['redis'])
group('wide-column', 'non-relational', '宽列')
techs('wide-column', ['cassandra'])
group('graph-db', 'non-relational', '图')
techs('graph-db', ['neo4j'])
group('storage-form', 'database', '按存储 / 运行形态', 'dimension', {
  classificationBasis: '与数据模型交叉的存储及运行维度',
})
group('embedded', 'storage-form', '文件型 / 嵌入式')
techs('embedded', ['sqlite', 'duckdb'])
group('server-db', 'storage-form', '独立服务')
techs('server-db', ['mysql', 'postgres'])
group('db-tools', 'database', '配套工具')
group('admin', 'db-tools', '管理客户端')
techs('admin', ['dbeaver', 'pgadmin'])
group('data-libs', 'db-tools', '数据访问库')
techs('data-libs', ['prisma', 'typeorm'])
group('other-data', 'data', '其他数据能力', 'function', {
  classificationBasis: '独立能力，不属于缓存到数据库的必经阶段',
})
group('search', 'other-data', '搜索')
techs('search', ['elastic'])
group('objects', 'other-data', '对象存储')
techs('objects', ['minio'])
group('analytics', 'other-data', '数据分析')
techs('analytics', ['clickhouse', 'duckdb'])
domain('runtime', '语言运行环境')
techs('runtime', ['node', 'v8', 'jvm', 'python'])
domain('deployment', '部署与资源管理')
group('images', 'deployment', '镜像构建与分发')
techs('images', ['buildkit', 'harbor', 'docker'])
group('containers', 'deployment', '容器运行')
techs('containers', ['docker', 'containerd', 'runc'])
group('orchestration', 'deployment', '容器编排')
techs('orchestration', ['kubernetes'])
domain('os', '操作系统与虚拟化')
group('kernel', 'os', '进程、内存与内核')
techs('kernel', ['linux'])
group('filesystem', 'os', '文件系统')
techs('filesystem', ['ext4'])
group('virtualization', 'os', '虚拟化')
techs('virtualization', ['kvm'])
domain('infrastructure', '基础设施')
group('compute', 'infrastructure', '计算与内存')
techs('compute', ['cpu', 'memory'])
group('disk', 'infrastructure', '存储设备')
techs('disk', ['ssd'])
group('network', 'infrastructure', '网络')
techs('network', ['tcp', 'dns'])
domain('support', '跨层支撑', { classificationBasis: '支持多个职责的横向能力，不是请求链的最后一步' })
group('engineering', 'support', '工程与交付')
techs('engineering', ['vite', 'vitest', 'jenkins', 'buildkit'])
group('observability', 'support', '可观测性')
techs('observability', ['prometheus', 'otel', 'grafana'])
group('security', 'support', '安全')
techs('security', ['oauth', 'tls', 'vault'])
