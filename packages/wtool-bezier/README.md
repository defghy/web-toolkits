# wtool-bezier

基于 `Vue@2.7`、`Konva` 和 `bezier-js` 的贝塞尔曲线编辑器。

- `BezierEditor`：曲线编辑器组件（下文简称编辑器）
- `EasingCurve` / `EasingPresetCurve`：缓动曲线编辑与缩略图

## 安装

```bash
npm install @yuhufe/wtool-bezier
```

## 快速开始

```vue
<template>
  <div style="width: 600px; height: 400px">
    <BezierEditor ref="editorRef" v-model="curves" :plugins="plugins" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { BezierEditor, PluginFlagPoint, useBezier, type BezierCurveSingle } from '@yuhufe/wtool-bezier'

export default defineComponent({
  components: { BezierEditor },
  setup() {
    const editorRef = ref()
    const { toggleMode, getEditMode } = useBezier({ comp: editorRef })
    const curves = ref<BezierCurveSingle[]>([
      {
        id: 'curve-1',
        flagPoints: [],
        curveSegs: [
          {
            id: 'seg-1',
            start: { x: 100, y: 300 },
            end: { x: 500, y: 100 },
            startCtrl: { x: 200, y: 100 },
            endCtrl: { x: 400, y: 300 },
          },
        ],
      },
    ])

    return { editorRef, curves, toggleMode, getEditMode, plugins: [PluginFlagPoint] }
  },
})
</script>
```

### Props

| Prop            | 类型                        | 默认值                            | 说明                                                 |
| --------------- | --------------------------- | --------------------------------- | ---------------------------------------------------- |
| `modelValue`    | `BezierCurveSingle[]`       | `[]`                              | 曲线数据，支持 `v-model`                             |
| `backgroundImg` | `BackImgInfo`               | -                                 | 背景图配置，包含 `url`、`scale`、`x`、`y`、`opacity` |
| `isLinear`      | `boolean`                   | `true`                            | 多段曲线是否首尾连续                                 |
| `theme`         | `BezierTheme`               | -                                 | 覆盖默认主题                                         |
| `comps`         | `{ aboveBack?: Component }` | -                                 | 在背景图上方插入自定义 Konva 组件                    |
| `plugins`       | `BezierPlugin[]`            | `[PluginFlagPoint, PluginTravel]` | 编辑器插件                                           |

组件会触发 `change`（数据变更）、`changeScale`、`changePos` 事件。

## useBezier

`useBezier` 通过编辑器组件 ref 获取实例方法。

```ts
import { ref } from 'vue'
import { useBezier, BezierEditMode } from '@yuhufe/wtool-bezier'

const editorRef = ref()

const {
  toggleMode, // 切换编辑模式
  getEditMode, // 获取当前模式
  when, // 注册事件监听
  travel, // 轨迹动画控制
  selectGrpCurve, // 选中曲线
  hoverGrpCurve, // 悬停曲线
  getSingleFuncs, // 获取单条曲线的方法
  centerAndFitbackImg,
  ueUtilGet,
} = useBezier({ comp: editorRef })
```

### API

| 方法                  | 说明                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| `toggleMode`          | `(mode: BezierEditMode) => void` 切换编辑模式，再次传入当前模式则退出   |
| `getEditMode`         | `() => BezierEditMode` 获取当前编辑模式                                |
| `selectGrpCurve`      | `(id: string) => void` 程序化选中曲线                                  |
| `hoverGrpCurve`       | `(id: string, isHover: boolean) => void` 程序化悬停曲线                |
| `when`                | `(handlers) => Promise<{ unbind }>` 注册事件监听，返回值可注销         |
| `getSingleFuncs`      | `(id: string) => SingleInnerAPI` 获取指定逻辑曲线的数据与 CRUD 方法    |
| `centerAndFitbackImg` | 背景图居中适配视口                                                     |
| `ueUtilGet`           | 获取手势目标控制器，可切换缩放/平移目标                                |
| `travel.start`        | `(params?: { randomStart?; randomDisturb? }) => void` 启动轨迹动画     |
| `travel.pause`        | 暂停轨迹动画                                                           |
| `travel.resume`       | 恢复轨迹动画                                                           |
| `travel.stop`         | 停止轨迹动画                                                           |

### 编辑模式

```ts
enum BezierEditMode {
  common = 'common',
  add = 'add',
  flag = 'flag',
  del = 'del',
  fitting = 'fitting',
  easingAdd = 'easingAdd',
  easingDel = 'easingDel',
}
```

| 模式     | 交互                 | 行为                                    |
| -------- | -------------------- | --------------------------------------- |
| `common` | 悬停、点击曲线       | 高亮并选中曲线                          |
| `add`    | 点击画布空白处       | 在选中曲线末尾追加曲线段                |
| `add`    | 点击已有曲线段       | 在点击位置分割曲线                      |
| `flag`   | 点击已有曲线段       | 新增标记点（需 `PluginFlagPoint`）      |
| `del`    | 点击曲线/控制点/端点 | 删除对应曲线段                          |
| `del`    | 点击标记点           | 删除该标记点                            |
| `fitting`| 点击画布空白处       | 触发 `onFittingAdd`，由外部创建拟合曲线 |

### 示例：切换编辑模式

```ts
const { toggleMode, getEditMode } = useBezier({ comp: editorRef })

const setMode = (mode: BezierEditMode) => toggleMode(mode)
const current = () => getEditMode()
```

### 示例：监听事件

```ts
const { when } = useBezier({ comp: editorRef })

const binding = await when({
  onGrpCurveSelected({ grpCurveId }) {
    console.log('selected', grpCurveId)
  },
  onSegCurveClick({ curveInfo, index }) {
    console.log('clicked segment', index, curveInfo)
  },
  afterFlagPointAdd({ curveId, flagPoint }) {
    console.log('flag added', curveId, flagPoint)
  },
  afterFlagPointDel({ curveId, flagPointKey }) {
    console.log('flag removed', curveId, flagPointKey)
  },
  travelStart() {},
  travelStop() {},
})

// 注销
binding.unbind()
```

常用事件：

| 事件                    | 参数                                                  |
| ----------------------- | ----------------------------------------------------- |
| `onStageClick`          | `{ evt, funcs }`                                      |
| `onSegCurveEnter`       | `{ segCurveId, grpCurveId, funcs, singleFuncs }`      |
| `onSegCurveLeave`       | `{ segCurveId, grpCurveId, funcs, singleFuncs }`      |
| `onSegCurveClick`       | `{ curveInfo, index, startCtrlPos, endCtrlPos, ... }` |
| `onControlPointClick`   | `{ point, originPoint, index, funcs, singleFuncs }`   |
| `onEdPointClick`        | `{ point, index, funcs, singleFuncs }`                |
| `onFlagPointClick`      | `{ flagPoint, funcs, singleFuncs }`                   |
| `onGrpCurveSelected`    | `{ grpCurveId, funcs, singleFuncs }`                  |
| `onFittingAdd`          | `{ pos: Point }`                                      |
| `afterFlagPointAdd`     | `{ curveId, flagPoint }`                              |
| `afterFlagPointDel`     | `{ curveId, flagPointKey }`                           |
| `travelStart`           | `{ randomStart?, randomDisturb? }`                    |
| `travelPause`           | 无                                                    |
| `travelResume`          | 无                                                    |
| `travelStop`            | 无                                                    |

### 示例：默认选中曲线

```ts
import { onMounted } from 'vue'

const { selectGrpCurve } = useBezier({ comp: editorRef })

onMounted(() => {
  selectGrpCurve(curves.value[0].id)
})
```

### 示例：程序化增删标记点

```ts
const { getSingleFuncs } = useBezier({ comp: editorRef })
const singleFuncs = getSingleFuncs('curve-1')

singleFuncs.crud.addFlagPointByPos({
  pos: { x: 120, y: 80 },
  key: crypto.randomUUID(),
  type: 'common',
})

singleFuncs.crud.delFlagPoint(flagPointKey)
```

### 示例：轨迹动画

曲线数据需开启 `trail.enable` 并配置 `easingData`。

```ts
const curves = ref<BezierCurveSingle[]>([
  {
    id: 'curve-travel',
    flagPoints: [],
    trail: { enable: true, cycle: false },
    easingData: {
      type: EasingType.bezier,
      duration: 2000,
      params: { curves: easingCurves },
    },
    curveSegs: [
      /* ... */
    ],
  },
])

const { travel } = useBezier({ comp: editorRef })

travel.start({ randomDisturb: 0 })
travel.pause()
travel.resume()
travel.stop()
```

## 插件 plugins

`plugins` 用于向编辑器注入额外能力，默认启用 `PluginFlagPoint` 和 `PluginTravel`。

- `PluginFlagPoint`：曲线标记点。新增 `flag` 编辑模式，可在曲线上点击新增标记、在 `del` 模式点击删除标记。
- `PluginTravel`：轨迹动画小球。配合曲线数据上的 `trail.enable` 与 `useBezier().travel` 使用。

```vue
<template>
  <BezierEditor v-model="curves" :plugins="[PluginFlagPoint, PluginTravel]" />
</template>
```

### 自定义插件

```ts
interface BezierPlugin {
  components?: {
    inCurve?: Component // 渲染在每条曲线上的组件
  }
  registerMode?: (args: {
    modeAdd: BezierModeConfig
    modeDel: BezierModeConfig
    modeCommon: BezierModeConfig
    funcs: InnerAPI
    selectSingle: (args: { singleFuncs: SingleInnerAPI }) => void
  }) => Record<string, BezierModeConfig>
}
```

`registerMode` 返回的模式会按 `BezierEditMode` 合并进编辑器，可覆盖或扩展内置模式。

```ts
const MyPlugin = {
  components: { inCurve: MyOverlay },
  registerMode({ modeCommon, selectSingle }) {
    return {
      // 覆盖 common 模式下标记点的点击行为
      [BezierEditMode.common]: {
        ...modeCommon,
        onFlagPointClick({ singleFuncs, flagPoint }) {
          selectSingle({ singleFuncs })
          console.log('clicked flag', flagPoint.key)
        },
      },
      // 新增自定义模式
      [BezierEditMode.fitting]: {
        onEnter() {},
        onFlagPointClick() {},
      },
    }
  },
}
```
