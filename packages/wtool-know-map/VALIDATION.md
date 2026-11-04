# 树形视图验证记录

日期：2026-11-04。当前实现按最新需求使用紧凑目录树，取代原 Treemap 矩形视图。

## 工程

- 正式数据：96 个实体、190 个展示入口、11 条带场景关系。
- `pnpm test`：2 个测试文件、16 项核心测试。
- `pnpm build`：数据校验、TypeScript 检查和生产构建。
- `pnpm install --filter @yuhufe/know-map --frozen-lockfile`：通过。
- 已移除 `d3-hierarchy` 及其类型依赖、矩形布局、聚焦历史和尺寸观察。

核心测试覆盖数据树、引用和场景关系、多入口实体、路径搜索，以及树形可见行、展开与收起、祖先路径定位、有序职责和数据阶段、隐藏后代状态清理、无效 ID、树形连接线与无障碍层级。

## 浏览器

环境：Intel Core Ultra X7 358H，Linux / WSL2，Node.js 24.20.0，HeadlessChrome 152.0.7977.75。

`pnpm test:browser` 验证：

- 1440 × 1000 桌面默认展开到第二层，保持紧凑行高；手动收起后刷新恢复该状态。
- 分类点击即时展开和收起，其他职责始终保留在树中。
- 上下键浏览，左右键展开、进入子节点、收起及回到父节点。
- 搜索 Vue 自动展开完整路径，目标高亮且滚动到可见区域，详情在对应节点下方按内容高度展示。
- Redis 多入口跳转、URL 刷新恢复、收起祖先后清理后代说明。
- 缓存、持久化与存储、其他数据能力按数据配置保持顺序。
- 390 × 844 触屏视口：搜索 Kubernetes、点击展开及收起说明，无横向溢出。
- 无效 URL 和禁用 localStorage 不白屏。
- 无页面 JavaScript 错误。

[浏览器结果](./validation/browser-result.json) 保存本次环境与检查项目。截图输出到 `/tmp/know-map-check/tree-desktop.png` 和 `tree-mobile.png`。这些记录对应当前树形视图，不沿用旧 Treemap 的性能采样。

## 内容资料

实体均附官方资料。D3、SQLite、Docker、Kubernetes 的关键资料已核验；其余资料的 `checkedAt` 保持空日期，等待逐项复核。
