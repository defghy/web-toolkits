# 文件左侧导航开发

- 目标组件：- diff 工具左侧文件导航：/Users/happyelements/project/me/web-toolkits/packages/wtool-vdiff/src/DiffFiles/FileExplore/FileExplore.vue
- 样例数据：/Users/happyelements/project/me/web-toolkits/packages/wtool-vdiff/site/assets/fileListDiff.json

## 功能

- 目录合并：如果多个文件都在 a/b/c 目录下，那么 a/b/c 单独一行，能够有效减少展示缩进层级
- 树每个节点区分 directory 和 file，文件名前面使用不同的 svg 来区分
- （本次先不做）支持搜索：由于是虚拟滚动，因此需要提供搜索工具，放置在文件树上方。

## 技术方案

使用库“@wsfe/vue-tree”实现支持虚拟滚动的树，以防有 1000+文件进行 diff

库文档请查看文件夹下 md 文件

- 目录：/Users/happyelements/project/libs/vue-tree/site/examples
