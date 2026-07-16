# 文件左侧导航开发

- 目标组件：- diff 工具左侧文件导航：/Users/happyelements/project/me/web-toolkits/packages/wtool-vdiff/src/DiffFiles/FileExplore/FileExplore.vue
- 样例数据：/Users/happyelements/project/me/web-toolkits/packages/wtool-vdiff/site/assets/fileListDiff.json

## 功能

- 支持搜索：由于是虚拟滚动，因此需要提供搜索工具，放置在文件树上方。
- 搜索框在文件导航上方，不随文件列表滚动

## 技术方案

- 搜索单独抽取一个组件
- 使用 treeUtil.filter 实现树的过滤，注意节流

库文档请查看文件夹下 md 文件

- 目录：/Users/happyelements/project/libs/vue-tree/site/examples
