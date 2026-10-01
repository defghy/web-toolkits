import { Ref, computed } from 'vue'
import { cloneDeep, merge } from 'lodash-es'
import chroma from 'chroma-js'
import { BezierCurveSingle, CurveWidgetType } from '../types'
import { useInner } from './useInner'

// 应对线在不同编辑阶段不同样式
const alterColors = [
  { c: '#faad14' },
  { c: '#a0d911' },
  { c: '#fa541c' },
  { c: '#1677ff' },
  { c: '#eb2f96' },
  { c: '#08979c' },
  { c: '#b37feb' },
].map(item => {
  return {
    ...item,
    lightc: chroma.mix(item.c, 'white', 0.4).hex(),
    darkc: chroma.mix(item.c, 'black', 0.5).hex(),
  }
})

export type BezierTheme = ReturnType<typeof makeTheme>

// 创建主题
export const makeTheme = function (myTheme?: any) {
  const sample = {
    pointSize: 8, // 端点尺寸
    point: {
      stroke: '#fffb8f', // 边框颜色
      zIdx: 2,
      strokeWidth: 0,
    },
    [CurveWidgetType.curve]: {
      strokeWidth: 2, // 线宽
      stroke: '#faad14', // 曲线颜色
      zIdx: 0,
    },
    // 控制线
    [CurveWidgetType.controlLine]: {
      strokeWidth: 2,
      stroke: '#bae0ff', // 控制线颜色
      dash: [8, 4],
      zIdx: 1,
    },
    // 曲线的影子，用于选中
    shadowCurve: {
      stroke: 'transparent',
      strokeWidth: 0,
    },
    colors: {
      headPoint: '#C93036', // 起点特殊颜色
      point: '#36cfc9', // 端点颜色
      startCtrlPoint: '', // 控制点颜色
      endCtrlPoint: '', // 控制点颜色
    },
  }
  type Sample = typeof sample
  const BaseTheme = merge(sample, (myTheme || {}) as Sample)
  const thickCurveWidth = BaseTheme.curve.strokeWidth * 2
  const pointSize = BaseTheme.pointSize
  const DefaultTheme = merge(BaseTheme, {
    point: {
      strokeWidth: +(pointSize / 12).toFixed(2),
    },
    // 曲线的影子，用于选中
    shadowCurve: {
      strokeWidth: thickCurveWidth,
      stroke: 'transparent',
    },
  })
  merge(DefaultTheme, myTheme || {})

  const SpecTheme = {
    hovered: {
      point: {
        strokeWidth: +(pointSize / 4).toFixed(2),
        stroke: '#fffb8f', // 边框颜色
      },
      shadowCurve: {
        stroke: '#fffb8f',
        shadowColor: '#feffe6',
        shadowBlur: 4,
        shadowOpacity: 1,
      },
    },
    selected: {
      // 对于线，不支持边框，使用2条线来实现边框
      shadowCurve: {
        stroke: '#fffb8f',
        shadowColor: '#feffe6',
        shadowBlur: 4,
        shadowOpacity: 1,
      },
    },
    remove: {
      shadowCurve: {
        stroke: '#ff7875',
        strokeWidth: Math.round(thickCurveWidth * 1.5),
      },
    },
    add: {
      shadowCurve: {
        stroke: '#b7eb8f',
        strokeWidth: Math.round(thickCurveWidth * 1.5),
      },
    },
  }

  ;(DefaultTheme as any).spec = SpecTheme

  return DefaultTheme as Sample & { spec: typeof SpecTheme }
}

const fittingPublicTheme = {
  curve: { stroke: '#fff', strokeWidth: 1.5 },
  shadowCurve: { stroke: '#000', strokeWidth: 3 },
}

export const useSingleTheme = function ({ data, index }: { data: Ref<BezierCurveSingle>; index: Ref<number> }) {
  const { funcs } = useInner()

  const singleTheme = computed(() => {
    const globalTheme = cloneDeep(funcs.theme)
    const owner = data.value?.owner

    if (owner) {
      // 公共拟合线：白底黑色描边
      if (owner === '__shared__') {
        return merge(globalTheme, fittingPublicTheme) as BezierTheme
      }

      // 归属某条ref的拟合线：ref颜色的浅色版
      const ownerSingle = funcs.singleFuncsMap?.[owner]
      if (ownerSingle) {
        const ownerStroke = ownerSingle.theme?.value?.curve?.stroke
        if (ownerStroke) {
          const light = alterColors.find(item => item.c === ownerStroke)?.lightc
          return merge(globalTheme, {
            curve: { stroke: light },
          }) as BezierTheme
        }
      }
    }

    // 普通参考线
    const color = alterColors[index.value % alterColors.length]
    return merge(globalTheme, { curve: { stroke: color.c } }) as BezierTheme
  })

  return { singleTheme }
}
