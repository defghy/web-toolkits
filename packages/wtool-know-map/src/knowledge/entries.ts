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

domain('frontend', '用户界面与客户端应用', { searchLabel: '前端' })
group('interface', 'frontend', '用户界面', 'function', { compactInSearchPath: true })
group('platform', 'interface', '平台与应用形态', 'dimension', {
  compactInSearchPath: true,
  classificationBasis: '按应用平台与交付形态分类，同一界面能力可在多个平台复用',
})
group('web', 'platform', 'Web 端')
group('ui', 'web', 'UI 库 / 框架', 'function', { compactInSearchPath: true })
techs('ui', ['vue', 'react', 'angular', 'svelte', 'solid', 'preact', 'lit'])
group('app-framework', 'web', '应用框架')
techs('app-framework', ['nuxt', 'next', 'sveltekit', 'astro'])
group('design-system', 'web', '组件库与设计系统')
techs('design-system', ['antd', 'element-plus', 'mui', 'shadcn-ui'])
group('styling', 'web', '样式与布局')
techs('styling', ['tailwind', 'sass', 'postcss', 'bootstrap'])
group('native', 'platform', '移动原生')
techs('native', ['android', 'swiftui', 'uikit'])
group('cross', 'platform', '桌面与跨平台')
techs('cross', ['electron', 'tauri', 'rn', 'flutter', 'capacitor', 'ionic'])
group('mini', 'platform', '小程序')
techs('mini', ['mini', 'taro'])
group('vehicle', 'platform', '车机与其他终端')
techs('vehicle', ['qt'])
group('client', 'interface', '客户端应用与架构', 'function', { compactInSearchPath: true })
group('routing', 'client', '路由')
techs('routing', ['router', 'react-router'])
group('state', 'client', '状态管理')
techs('state', ['pinia', 'redux', 'zustand', 'jotai', 'xstate'])
group('forms', 'client', '表单与校验')
techs('forms', ['react-hook-form', 'zod'])
group('i18n', 'client', '国际化')
techs('i18n', ['i18next', 'vue-i18n'])
group('a11y', 'client', '无障碍')
techs('a11y', ['axe-core'])
group('specialty', 'interface', '专业能力', 'dimension', {
  compactInSearchPath: true,
  classificationBasis: '按界面专业能力分类，与终端平台交叉',
})
group('editor', 'specialty', '编辑器与富文本')
techs('editor', ['monaco', 'codemirror', 'prosemirror', 'tiptap', 'lexical', 'slate', 'quill', 'ckeditor'])
group('charts', 'specialty', '图表与数据可视化')
techs('charts', ['echarts', 'd3', 'antv', 'chartjs', 'plotly', 'recharts'])
group('animation', 'specialty', '动画与交互')
techs('animation', ['gsap', 'motion'])
group('3d', 'specialty', '3D 渲染')
group('graphics-api', '3d', '图形 API')
techs('graphics-api', ['webgl', 'webgpu'])
group('3d-engine', '3d', '引擎与库')
techs('3d-engine', ['three', 'babylon', 'cesium', 'playcanvas'])
group('2d', 'specialty', 'Canvas / 2D 绘制')
group('2d-api', '2d', '图形 API')
techs('2d-api', ['canvas'])
group('2d-lib', '2d', '图形库')
techs('2d-lib', ['konva', 'fabric', 'pixi', 'p5'])
group('gis', 'specialty', 'GIS / 地理信息')
group('map-display', 'gis', '地图展示与交互')
techs('map-display', ['openlayers', 'leaflet', 'maplibre', 'mapbox-gl'])
group('geo-compute', 'gis', '地理计算')
techs('geo-compute', ['turf'])
group('geo-3d', 'gis', '三维地理场景')
techs('geo-3d', ['cesium', 'deck-gl'])
group('map-services', 'gis', '厂商地图 SDK 与服务接入', 'function', {
  classificationBasis: '按地图厂商的 SDK 与位置服务接入分类，能力可覆盖地图展示、交互及地理计算。',
})
techs('map-services', ['amap', 'baidu-map', 'google-maps', 'arcgis-js'])
group('media', 'specialty', '音视频与实时交互')
group('media-realtime', 'media', '实时通信')
techs('media-realtime', ['webrtc', 'livekit'])
group('media-playback', 'media', '播放与流媒体')
techs('media-playback', ['hlsjs', 'videojs'])
group('media-processing', 'media', '采集与处理')
techs('media-processing', ['webcodecs', 'webaudio', 'ffmpeg-wasm'])
group('collab-editing', 'specialty', '协同编辑')
techs('collab-editing', ['yjs', 'automerge'])
group('foundations', 'interface', '基础技术')
techs('foundations', ['html', 'css', 'javascript', 'typescript', 'web-components', 'webassembly'])

group('client-runtime', 'frontend', '客户端通信与存储', 'function', {
  compactInSearchPath: true,
  classificationBasis: '客户端应用共享的通信、存储与离线能力，不等同于某个界面框架。',
})
group('comm', 'client-runtime', '网络与通信')
group('request', 'comm', '请求与数据获取')
techs('request', ['fetch', 'axios', 'tanstack-query', 'swr'])
group('realtime', 'comm', '实时通信')
techs('realtime', ['websocket', 'sse', 'socketio'])
group('storage', 'client-runtime', '本地存储')
group('browser-storage', 'storage', '浏览器存储')
techs('browser-storage', ['indexeddb', 'localstorage', 'cache-api'])
group('local-db', 'storage', '本地数据库')
techs('local-db', ['dexie', 'sqlite-wasm'])
group('client-cache', 'storage', '缓存')
techs('client-cache', ['http-cache'])
group('offline', 'client-runtime', '离线与 PWA')
techs('offline', ['service-worker', 'workbox', 'pwa'])

domain('ingress', '接入与流量')
group('edge', 'ingress', '边缘分发与域名')
techs('edge', ['cdn', 'dns'])
group('proxy', 'ingress', '代理与负载均衡')
techs('proxy', ['nginx', 'envoy', 'traefik', 'haproxy', 'caddy'])
group('gateway', 'ingress', 'API 网关')
techs('gateway', ['kong'])

domain('backend', '后端与服务')
group('business', 'backend', '服务与业务')
group('api', 'business', 'BFF 与业务接口')
techs('api', ['nestjs', 'express', 'fastify', 'spring', 'fastapi', 'django', 'flask', 'gin', 'graphql'])
group('rules', 'business', '业务规则', 'function', {
  classificationBasis: '鉴权、订单、交易等规则由具体产品实现；这里不强制对应某个框架。',
})
group('collaboration', 'backend', '服务协作')
group('rpc', 'collaboration', '服务调用')
techs('rpc', ['grpc', 'trpc'])
group('messaging', 'collaboration', '消息与事件')
techs('messaging', ['rabbitmq', 'kafka', 'nats'])
group('jobs', 'collaboration', '异步任务与工作流')
techs('jobs', ['bullmq', 'celery', 'temporal'])
group('microservices', 'collaboration', '微服务', 'function', {
  classificationBasis: '将业务拆分为可独立部署、相互协作的服务，是可选的架构方式。',
})
group('service-governance', 'microservices', '服务治理', 'function', {
  classificationBasis: '管理服务间通信的流量、安全与可观测性，可通过服务网格等不同方案实现。',
})
group('service-mesh', 'service-governance', '服务网格（可选方案）', 'approach', {
  classificationBasis: '服务治理的一种可选实现方案，通过代理与控制面统一管理服务间通信，不是请求必经层级。',
})
techs('service-mesh', ['istio', 'linkerd'])
group('access', 'backend', '数据访问')
group('orm', 'access', '查询封装与 ORM')
techs('orm', ['prisma', 'typeorm', 'drizzle', 'sqlalchemy', 'hibernate'])
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
techs('relational', ['mysql', 'postgres', 'sqlite', 'mariadb', 'cockroachdb', 'tidb'])
group('non-relational', 'data-model', '非关系型')
group('document', 'non-relational', '文档')
techs('document', ['mongodb', 'couchdb'])
group('key-value', 'non-relational', '键值')
techs('key-value', ['redis', 'etcd'])
group('wide-column', 'non-relational', '宽列')
techs('wide-column', ['cassandra', 'scylladb'])
group('graph-db', 'non-relational', '图')
techs('graph-db', ['neo4j', 'arangodb'])
group('time-series', 'non-relational', '时序')
techs('time-series', ['influxdb'])
group('vector-db', 'non-relational', '向量')
techs('vector-db', ['milvus', 'qdrant'])
group('storage-form', 'database', '按存储 / 运行形态', 'dimension', {
  classificationBasis: '与数据模型交叉的存储及运行维度',
})
group('embedded', 'storage-form', '文件型 / 嵌入式')
techs('embedded', ['sqlite', 'duckdb'])
group('server-db', 'storage-form', '独立服务')
techs('server-db', ['mysql', 'postgres'])
group('distributed', 'storage-form', '分布式')
techs('distributed', ['cockroachdb', 'tidb'])
group('db-tools', 'database', '配套工具')
group('admin', 'db-tools', '管理客户端')
techs('admin', ['dbeaver', 'pgadmin'])
group('data-libs', 'db-tools', '数据访问库')
techs('data-libs', ['prisma', 'typeorm', 'drizzle'])
group('other-data', 'data', '其他数据能力', 'function', {
  classificationBasis: '独立能力，不属于缓存到数据库的必经阶段',
})
group('search', 'other-data', '搜索')
techs('search', ['elastic', 'opensearch', 'meilisearch'])
group('objects', 'other-data', '对象存储')
techs('objects', ['minio', 'ceph'])
group('analytics', 'other-data', '数据分析')
techs('analytics', ['clickhouse', 'duckdb'])
group('stream', 'other-data', '流处理')
techs('stream', ['kafka', 'flink'])
group('spatial', 'other-data', '空间数据')
techs('spatial', ['postgis'])

domain('runtime', '语言与运行时')
group('languages', 'runtime', '编程语言')
techs('languages', ['javascript', 'typescript', 'java', 'go', 'rust', 'csharp'])
group('engines', 'runtime', '语言引擎与虚拟机')
techs('engines', ['v8', 'jvm', 'python'])
group('runtimes', 'runtime', '运行环境')
techs('runtimes', ['node', 'deno', 'bun'])

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
techs('compute', ['cpu', 'gpu', 'memory'])
group('disk', 'infrastructure', '存储设备')
techs('disk', ['ssd', 'hdd'])
group('network', 'infrastructure', '网络')
techs('network', ['tcp', 'dns'])

domain('support', '跨层支撑', { classificationBasis: '支持多个职责的横向能力，不是请求链的最后一步' })
group('engineering', 'support', '工程与交付')
group('vcs', 'engineering', '版本控制')
techs('vcs', ['git'])
group('package-manager', 'engineering', '包管理')
techs('package-manager', ['npm', 'pnpm', 'yarn'])
group('build', 'engineering', '构建工具')
techs('build', ['vite', 'webpack', 'esbuild', 'rollup'])
group('monorepo', 'engineering', '单仓管理')
techs('monorepo', ['turborepo', 'nx'])
group('code-quality', 'engineering', '代码质量')
techs('code-quality', ['eslint', 'prettier'])
group('testing', 'engineering', '测试')
techs('testing', ['vitest', 'jest', 'playwright', 'testing-library', 'storybook'])
group('ci-cd', 'engineering', '持续集成与交付')
techs('ci-cd', ['jenkins', 'github-actions'])
group('iac', 'engineering', '基础设施即代码')
techs('iac', ['terraform', 'ansible'])
group('observability', 'support', '可观测性')
group('metrics', 'observability', '指标')
techs('metrics', ['prometheus', 'grafana'])
group('logging', 'observability', '日志')
techs('logging', ['loki'])
group('tracing', 'observability', '链路追踪')
techs('tracing', ['otel', 'jaeger'])
group('error-monitoring', 'observability', '错误与体验监控')
techs('error-monitoring', ['sentry'])
group('security', 'support', '安全')
group('auth', 'security', '认证与授权')
techs('auth', ['oauth', 'oidc', 'jwt', 'keycloak', 'opa'])
group('transport', 'security', '传输安全')
techs('transport', ['tls'])
group('secrets', 'security', '密钥管理')
techs('secrets', ['vault'])
group('scanning', 'security', '安全扫描')
techs('scanning', ['trivy', 'snyk', 'zap'])
group('web-security', 'security', 'Web 应用安全')
techs('web-security', ['csp', 'cors'])
group('supply-chain', 'security', '供应链安全')
techs('supply-chain', ['sigstore'])
