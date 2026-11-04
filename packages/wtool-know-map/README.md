# 互联网技术知识树

基于 Vue 3 和 TypeScript 的技术知识目录。页面仅保留搜索框与树形节点，通过缩进和连接线表达分类关系；每个节点占一行，详情按内容展开高度。

## 开发

在仓库根目录执行：

```sh
pnpm install
pnpm --filter @yuhufe/know-map vite
pnpm --filter @yuhufe/know-map test
pnpm --filter @yuhufe/know-map build
```

构建包含数据校验与 TypeScript 检查，产物位于本包 `dist/`。使用 `pnpm --filter @yuhufe/know-map preview` 预览生产产物。

## 浏览

- 首次进入默认展开到第二层，后续刷新恢复手动展开、收起的状态。
- 点击分类行展开或收起直接子项，无需聚焦、双击或长按。
- 点击技术行，在该行下方查看简介、官方资料、带场景的关系和同一实体的其他入口；再次点击收起详情。
- 搜索作用于全部知识数据。选择结果后，自动展开祖先并滚动到目标，保留其他职责入口。
- Tab 进入树；上下方向键浏览可见节点，右键展开或进入子节点，左键收起或回到父节点；Home / End 跳到首尾，Enter / 空格激活节点。
- Escape 关闭搜索建议或技术详情；没有临时内容时收起当前分支。
- URL 保存选中节点；localStorage 按数据版本保存展开集合。旧版的 `focus` 链接仍可展开对应路径，禁用存储不影响浏览。

## 数据与代码

当前包含 96 个技术实体、190 个展示入口和 11 条带场景关系。职责顺序和分类层次沿用知识数据；缓存、数据库是同级分类，共享技术可以有多个独立入口。

- `src/knowledge/`：实体、展示树、职责顺序、关系、索引、搜索和数据校验。
- `src/map/tree.ts`：按展开集合生成可见树行，保持配置顺序与无障碍层级，处理路径展开及分支收起。
- `src/composables/useKnowledgeTree.ts`：展开、选择、活动节点、URL 和存储。
- `src/components/KnowledgeTree.vue`：紧凑树形、连接线、键盘导航和滚动定位。
- `src/components/NodeDetails.vue`：节点下方的技术说明与关系入口。
- `src/components/MapSearch.vue`：临时路径候选及键盘搜索。

无需图形引擎、SVG 矩形布局、尺寸观察或聚焦历史。新增数据后运行 `pnpm --filter @yuhufe/know-map validate:data`，检查 ID、引用、树无环、分类覆盖与关系端点。

所有实体附官方资料链接。`checkedAt` 仅填写实际核验日期：D3、SQLite、Docker、Kubernetes 已核验，其余空日期条目待逐项复核。

## 浏览器验证

浏览器检查使用 `puppeteer-core`，需本机已有 Chrome / Chromium。先启动开发服务，再在另一终端运行：

```sh
pnpm --filter @yuhufe/know-map vite --port 5178
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome pnpm --filter @yuhufe/know-map test:browser
```

支持自动寻找 Puppeteer 缓存中的 Linux headless shell。`KNOW_MAP_URL` 可修改开发服务地址；`BROWSER_ARTIFACT_DIR` 可修改截图和结果目录，默认 `/tmp/know-map-check`。脚本使用独立浏览器上下文，检查桌面、键盘、触屏、搜索定位、详情、多入口跳转、URL 恢复和禁用存储。记录见 [VALIDATION.md](./VALIDATION.md)。
