# vue-pixel-core

#### 基于`Vue@2.7`和`konva`的像素图编辑基础组件
#### 不实现具体的编辑工具，只提供绘制功能和必要的hook

## Demo

[地址](https://kxxxlfe.github.io/vue-pixel-core/)

## Quick Start

**Step1. Install**

```bash
$ npm install @kxxxl-front-end/vue-pixel-core
```

**Step2. Use `PixelPalette` component in your project**

```
<template>
  <div id="app">
      <PixelPalette
        :id="pixelId"
        :pixelData="pixelData"
        :enableUndo="true"
        @change="onChangeData"
      />
  </div>
</template>

<script>
import { PixelPalette } from "@kxxxl-front-end/vue-pixel-core";

export default defineComponent({
  components: { PixelPalette },
})
<script>
```

<br/>

## Props

> 参数格式如下，具体用法详见 [Props详细](#props-head)

| Name                        | Description                                    | Default                                                |
|-----------------------------|------------------------------------------------|--------------------------------------------------------|
| [id](#api-id)               | 提供给hook使用；用于区分多个棋盘场景。           | required                                               |
| [pixelData](#api-pixelData) | 像素图数据                                     | `[]`                                                   |
| [grid](#api-grid)           | 像素格子相关配置                               | `{ size: 20, render: null }`                           |
| [border](#api-border)       | 边框相关配置                                   | `{ size: 1, color: '#595959', groupColor: '#bfbfbf',}` |
| useBaseline                 | 是否显示棋盘基线以及格子数字标识               | true                                                   |
| useUndo                     | 是否支持撤销/重做，会占用快捷键                 | false                                                  |
| layout                      | 棋盘宽高数据；不设置会使用当前棋盘容器dom的宽高 | 无                                                     |
| groupInfo                   | 矩阵内的格子为一组，可以按组展示                | 默认不分组：`{ row: 0, col: 0 }`                        |

<details>

<summary id="props-head"><h3>Props详细</h3></summary>

<section id="api-id">
  <h4>id</h4>

  ```typescript
  import { usePixFunc, usePixEvent } from '@kxxxl-front-end/vue-pixel-core'

  const { getStage, scaleByCenter, centerAndPosition } = usePixFunc({ id: pixelId })
  const { when } = usePixEvent({ id: pixelId })
  ```
</section>

<section id="api-pixelData">
 <h4>pixelData</h4>

  - 为了实现多层编辑，需要一个3维数组格式如下
  - [样例数据](https://github.com/kxxxlfe/vue-pixel-core/blob/main/platforms/examples/data.json)

  ```typescript
  // 每个格子数据
  interface PixelGridData {
    color?: string // 当前格子色值
    disabled?: boolean // 格子是否可以编辑
    [key: string]: any // 可以添加自定义字段，用于自定义格子渲染
  }

  // 每一层数据
  interface PixelLayerData {
    id: string
    name: string
    zIndex: number
    grids: PixelGridData[][]
  }

  // pixelData格式
  type PixelData = PixelLayerData[]
  ```
  
  - [样例数据](https://github.com/kxxxlfe/vue-pixel-core/blob/main/examples/data.json)
</section>

<section id="api-grid">
  <h4>grid</h4>

  - demo
  
  ```html
    <PixelPalette
      :id="pixelId"
      :pixelData="pixelData"
      :grid="{ size: 20, render: CustomGrid }"
    />
  ```

  - 说明
    - size: 格子尺寸
    - render: 传递一个vue组件，用于自定义渲染每一个格子

  - render实例

  ```typescript

  <template>
    <KGroup :width="gridSize" :height="gridSize">
      <KRect :config="rectConfig" :x="0" :y="0" :width="gridSize" :height="gridSize" />
      <KText v-if="grid.colorIdx" :config="{ x: 18, y: 18, align: 'right', fill: '#fff'}" />
      <KImage v-if="grid.isQuill" :config="{ x: 18, y: 18, image: quillImage }" />
    </KGroup>
  </template>

  <script lang="ts">
  // 自定义树形，支持自定义节点
  import { PropType, computed, defineComponent, ref } from 'vue'
  import { KonvaComps, PixelGridData } from '@kxxxl-front-end/vue-pixel-core'

  import quillPng from './quill.png'
  const quillImage = new Image()
  quillImage.src = quillPng // konva要求传递的image数据

  const { KText, KGroup, KRect, KImage } = KonvaComps

  export default defineComponent({
    name: 'CustomGrid',
    components: { KText, KGroup, KRect, KImage },
    props: {
      grid: { type: Object as PropType<PixelGridData>, required: true }, // 当前渲染的格子
      isHover: Boolean, // 指针是否经过格子
      // 格子所在行列数
      row: { type: Number, required: true }, 
      col: { type: Number, required: true },
    },
    setup(props, { emit }) {

      return { quillImage }
    },
  })
  </script>

  ```
</section>

</details>

## Method and Field

> 所有的方法与字段都通过 `usePixFunc` 获取，示例如下

```typescript
const { getStage, scaleByCenter, positionByDelta, centerAndPosition } = usePixFunc({ id: pixelId })
```

| Name              | Description                                                   | Type                                                                                                  |
|-------------------|---------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| getStage          | 获取`konva`的`stage`对象                                      | [Konva.Stage](https://konvajs.org/docs/overview.html)                                                 |
| getHistoryDo      | 仅在`useUndo`时返回有效值                                     | `() => { undo, redo, undoStatus, redoStatus }`                                                        |
| centerAndPosition | 棋盘移动到容器中心，宽高尽量充满容器                           | `() => void`                                                                                          |
| scaleByCenter     | 以棋盘为中心，放大缩小                                         | `({ newScale: number }) => void`                                                                      |
| positionByDelta   | 平移棋盘位置                                                  | `({ deltaX?: number; deltaY?: number; }) => void`                                                     |
| exportImage       | 当前棋盘截图                                                  | `async (args: any) => string`; [args详见](https://konvajs.org/api/Konva.Group.html#toDataURL__anchor) |
| isRenderred       | 棋盘是否已经渲染完成；一些方法需要等待渲染完成才能返回有效内容 | `Promise<any>`                                                                                        |

## Events

> hook主要用于开发基于棋盘的交互，通过 `usePixEvent` 获取 `when` 使用；示例如下

```typescript
const { when } = usePixEvent({ id: pixelId })
when({
  onGridHover({ r, c, grid }) {
    state.currGrid = { r, c, groupId: grid.groupId }
  },
})
```

| Name                                  | Description                                | Hook Data                                       |
|---------------------------------------|--------------------------------------------|-------------------------------------------------|
| onGridHover                           | 指针经过格子时触发，一个grid触发一次        | `{ r, c, grid }`                                |
| [onGridPressed](#event-onGridPressed) | 指针按下时，经过grid时触发，一个grid触发一次 | `{ evt, r, c, currGrid, passByGrids, layerId }` |

<details>

<summary id="props-head"><h3>Events详细</h3></summary>

<section id="event-onGridPressed">
  <h4>onGridPressed</h4> 
  
  - 参数说明

  ```typescript
  type GridPressedParams = {
    evt: PointerEvent; // 原始事件
    r: number; // 格子行列数
    c: number;
    currGrid: PixelGridData; // 当前触发的格子数据
    layerId: string | number; // 当前触发的格子所在layer
    passGrids: PixelGridData[]; // 本次按下后，已经过的格子数组
  };
  ```
</section>

## Examples

  - 画笔实现

  ```typescript
  const { when } = usePixEvent({ id: pixelId })

  when({
    onGridPressed({ evt, r, c, currGrid, passByGrids, layerId }) {
      currGrid.color = toolForm.value.color
    },
  })
  ```

  - [其他工具示例-stackblitz](https://stackblitz.com/~/github.com/kxxxlfe/vue-pixel-core?file=platforms/examples/App.vue)


