# wtool-bezier

#### 基于 `Vue@2.7`、`Konva` 和 `bezier-js` 的贝塞尔曲线编辑组件

- `BezierEditor`：完整贝塞尔画板，支持多条逻辑曲线、标记点、缩放平移、背景图、轨迹动画
- `EasingCurve`：0-1 笛卡尔坐标系的多段缓动曲线与标记点编辑器
- `EasingPresetCurve`：单段缓动曲线的 SVG 缩略图，不可交互

## Demo

[地址](https://defghy.github.io/web-toolkits/bezier-demo/)

## Quick Start

**Step1. Install**

```bash
$ npm install @yuhufe/wtool-bezier
```

**Step2. Use `BezierEditor`**

```vue
<template>
  <div style="width: 600px; height: 400px">
    <BezierEditor ref="editorRef" v-model="curves" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { BezierEditor, useBezier, BezierEditMode } from '@yuhufe/wtool-bezier'

export default defineComponent({
  components: { BezierEditor },
  setup() {
    const editorRef = ref()
    const { toggleMode } = useBezier({ comp: editorRef })
    const curves = ref([
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

    return { editorRef, curves, toggleMode, BezierEditMode }
  },
})
</script>
```

<br/>

## 数据模型

### BezierCurveModel

一段三次贝塞尔曲线，四个点均使用直角坐标。

```ts
interface BezierCurveModel {
  id?: string
  start: Point
  end: Point
  startCtrl: Point
  endCtrl: Point
}
```

### BezierCurveSingle

`BezierEditor` 的 `v-model` 类型，每个元素代表一条由多段曲线组成的逻辑曲线。

```ts
interface BezierCurveSingle {
  id: string
  curveSegs: BezierCurveModel[]
  hide?: boolean
  trail?: { enable?: boolean; cycle?: boolean }
  easingData?: {
    type: EasingType
    duration: number
    params: { curves: BezierCurveModel[] }
  }
  owner?: string | '__shared__'
  flagPoints?: FlagPoint[]
  switches?: {
    showEdStart?: boolean
    showEdEnd?: boolean
    showControlPoint?: boolean
    canSelect?: boolean
    canDelete?: boolean
  }
}
```

> 参与编辑的曲线应显式初始化 `flagPoints: []`。

### FlagPoint

```ts
interface FlagPoint {
  key: string
  type: 'common' | 'extreme'
  point: Point
  progressType?: 'len' | 'x' | 'y'
  progress?: number
}
```

`progressType` 为 `len` / `x` / `y`，`progress` 为该维度上的归一化进度。曲线形状变化后，标记点会依据 `progress` 自动重新定位。

## BezierEditor

### Props

| Prop            | 类型                        | 默认值                            | 说明                                                 |
| --------------- | --------------------------- | --------------------------------- | ---------------------------------------------------- |
| `modelValue`    | `BezierCurveSingle[]`       | `[]`                              | 曲线数据，支持 `v-model`                             |
| `backgroundImg` | `BackImgInfo`               | -                                 | 背景图配置，包含 `url`、`scale`、`x`、`y`、`opacity` |
| `isLinear`      | `boolean`                   | `true`                            | 多段曲线是否首尾连续                                 |
| `theme`         | `BezierTheme`               | -                                 | 覆盖默认主题                                         |
| `comps`         | `{ aboveBack?: Component }` | -                                 | 在背景图上方插入自定义 Konva 组件                    |
| `plugins`       | `BezierPlugin[]`            | `[PluginFlagPoint, PluginTravel]` | 编辑器插件                                           |

组件会触发 `changeScale` 和 `changePos`，用于外部保存缩放、平移结果。

### useBezier

```ts
const { toggleMode, getEditMode, when, travel, centerAndFitbackImg, ueUtilGet, selectGrpCurve, getSingleFuncs } =
  useBezier({ comp: editorRef })
```

| 方法                  | 说明                                                  |
| --------------------- | ----------------------------------------------------- |
| `toggleMode`          | `(mode: BezierEditMode) => void` 切换编辑模式         |
| `getEditMode`         | `() => BezierEditMode` 获取当前编辑模式               |
| `when`                | 注册事件监听，返回 `{ unbind }`                       |
| `centerAndFitbackImg` | 背景图居中适配视口                                    |
| `ueUtilGet`           | 获取手势目标控制器，可切换缩放/平移目标               |
| `selectGrpCurve`      | 程序化选中逻辑曲线                                    |
| `getSingleFuncs`      | 获取指定逻辑曲线的计算函数与 CRUD                     |
| `travel.start`        | `(params?: { randomStart?; randomDisturb? }) => void` |
| `travel.pause`        | 暂停轨迹动画                                          |
| `travel.resume`       | 恢复轨迹动画                                          |
| `travel.stop`         | 停止轨迹动画                                          |

### 编辑模式

```ts
enum BezierEditMode {
  common = 'common',
  add = 'add',
  flag = 'flag',
  del = 'del',
  fitting = 'fitting',
}
```

| 模式      | 交互                 | 行为                                    |
| --------- | -------------------- | --------------------------------------- |
| `common`  | 悬停、点击曲线       | 高亮并选中曲线                          |
| `add`     | 点击画布空白处       | 在选中曲线末尾追加曲线段                |
| `add`     | 点击已有曲线段       | 在点击位置分割曲线                      |
| `flag`    | 点击已有曲线段       | 新增标记点                              |
| `del`     | 点击曲线/控制点/端点 | 删除对应曲线段                          |
| `del`     | 点击标记点           | 删除该标记点                            |
| `fitting` | 点击画布空白处       | 触发 `onFittingAdd`，由外部创建拟合曲线 |

### 程序化增删标记点

```ts
const singleFuncs = getSingleFuncs(curveId)

singleFuncs.crud.addFlagPointByPos({
  pos: { x: 120, y: 80 },
  key: crypto.randomUUID(),
  type: 'common',
})

singleFuncs.crud.delFlagPoint(flagPointKey)
```

## EasingCurve

```vue
<EasingCurve ref="easingRef" v-model="easingValue" />
```

```ts
const easingValue = ref({
  easingData: [
    {
      id: crypto.randomUUID(),
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      startCtrl: { x: 0.25, y: 0.1 },
      endCtrl: { x: 0.24, y: 0.89 },
    },
  ],
  flagPoints: [],
})
```

### useEasingExp

```ts
const { getTheme, toggleMode, getEditMode, when, getSingleFuncs } = useEasingExp({ comp: easingRef })
```

缓动编辑器只使用 `common`、`add`、`del` 模式，标记点通过 `v-model` 或单曲线 CRUD 创建。

## 轨迹动画

每条 `BezierCurveSingle` 在 `trail.enable` 为 `true` 时响应 `travel.*`。`trail.cycle` 为 `true` 时循环播放。

多段轨迹与多段缓动的计算流程：

1. 按实际曲线长度计算总路径与分段里程碑
2. 将已播放时间归一化为 0-1 时间进度
3. 在 `easingData.params.curves` 上按 x 定位交点，取交点 y 作为动画进度
4. 按动画进度映射到轨迹总长度，得到运动点坐标

## 事件

```ts
const binding = await when({
  onGrpCurveSelected({ grpCurveId }) {},
  onFittingAdd({ pos }) {},
  afterFlagPointAdd({ curveId, flagPoint }) {},
  afterFlagPointDel({ curveId, flagPointKey }) {},
  travelStart() {},
  travelStop() {},
})
binding.unbind()
```

| 事件                  | 参数                                                  |
| --------------------- | ----------------------------------------------------- |
| `onStageClick`        | `{ evt, funcs }`                                      |
| `onSegCurveEnter`     | `{ segCurveId, grpCurveId, funcs, singleFuncs }`      |
| `onSegCurveLeave`     | `{ segCurveId, grpCurveId, funcs, singleFuncs }`      |
| `onSegCurveClick`     | `{ curveInfo, index, startCtrlPos, endCtrlPos, ... }` |
| `onControlPointClick` | `{ point, originPoint, index, funcs, singleFuncs }`   |
| `onEdPointClick`      | `{ point, index, funcs, singleFuncs }`                |
| `onFlagPointClick`    | `{ flagPoint, funcs, singleFuncs }`                   |
| `onGrpCurveSelected`  | `{ grpCurveId, funcs, singleFuncs }`                  |
| `onFittingAdd`        | `{ pos: Point }`                                      |
| `afterFlagPointAdd`   | `{ curveId, flagPoint }`                              |
| `afterFlagPointDel`   | `{ curveId, flagPointKey }`                           |
| `travelStart`         | `{ randomStart?, randomDisturb? }`                    |
| `travelPause`         | 无                                                    |
| `travelResume`        | 无                                                    |
| `travelStop`          | 无                                                    |

## Examples

[demo 源码](./site)

- `BezierEdit`：单曲线编辑，支持增删曲线段/控制点
- `BezierTravel`：单曲线轨迹动画，支持缓动曲线与播放/暂停/停止
- `BezierFlag`：单曲线标记点增删
