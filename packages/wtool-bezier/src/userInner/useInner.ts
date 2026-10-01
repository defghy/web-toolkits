import { type Ref } from 'vue'
import type Konva from 'konva'
import { useCompExp } from '../common'
import {
  Point,
  BezierCurveInfo,
  BezierEditMode,
  BezierCurveSingle,
  BezierSwitches,
  BezierConfig,
  FlagPoint,
  BezierPlugin,
} from '../types'
import { polar2Rect, rect2Polar, screen2Cartesian, cartesian2Screen } from '../utils/utils'
import { BezierTheme } from './useTheme'
import { WhenCall, WhenFunc, useEventMaster, WhenEvent } from './useEvent'
import { useEditMode } from './useCurveMode'
import { useCurveCRUD } from './useCurveCRUD'
import { useFlagCRUD } from '../curve/BezierFlagPoint/useFlagPoint'
import { CurveCalcs } from './useCurveListCalc'

// 多条曲线之间数据共享
type PathFunc = {
  getLength: Konva.Path['getLength']
  getPointAtLength: Konva.Path['getPointAtLength']
}
export interface InnerAPI {
  theme: BezierTheme // 主题样式

  getStage: () => Konva.Stage
  getBackImgNode: () => Konva.Image
  updateCursor: (cursor: string) => any // 更新指针类型
  getCursor: () => string

  isLinear: Ref<boolean> // 是否首尾相连
  currEditMode: Ref<BezierEditMode>
  when: WhenFunc
  whenUnbind: WhenFunc
  whenCallbacks: any
  whenCall: WhenCall
  WhenEvent: typeof WhenEvent
  ueState: ReturnType<typeof useEditMode>['ueState']
  getMode: ReturnType<typeof useEditMode>['getMode']
  singleFuncsMap: Record<string, SingleInnerAPI>
  bezierConfig: BezierConfig
  flagProgressType: FlagPoint['progressType'] // 当前曲线标记，依据什么进度

  plugins: BezierPlugin[]

  // 对外api
  centerAndFitImg: Function
}
export const useInner = function ({ isMaster = false }: { isMaster?: boolean } = {}) {
  const exp = useCompExp<InnerAPI>({ isMaster, key: 'bezierInner' })

  return { ...exp, polar2Rect, rect2Polar, screen2Cartesian, cartesian2Screen }
}
export type InnerFunc = ReturnType<typeof useCompExp<InnerAPI>>

// 提供统一的api
export const useInnerMaster = function ({ stageRef }: { stageRef: Ref<any> }) {
  const { registerFunc, funcs, ...others } = useInner({ isMaster: true })

  function getStage() {
    return stageRef.value?.getNode() as Konva.Stage
  }

  useEventMaster({ exp: { registerFunc, funcs } } as any)

  const cursors = []
  registerFunc({
    getStage,
    updateCursor(newCursor) {
      const container = getStage().container()
      if (newCursor) {
        cursors.push(container.style.cursor)
        container.style.cursor = newCursor
      } else {
        container.style.cursor = cursors.pop() || ''
      }
    },
    getCursor() {
      const container = getStage().container()
      return container.style.cursor
    },
  })

  return { getStage, registerFunc, funcs, ...others }
}

// 一条多段曲线的数据分发
export interface SingleInnerAPI {
  pathFuncs: Record<string, PathFunc> // 用于路径动画的一些必要函数，提供给其他组件使用
  data: Ref<BezierCurveSingle>
  bezierCurves: Ref<BezierCurveInfo[]>
  updateCurve: (target: Function | any, value?: any) => any // 更新曲线数据，会导致曲线形状变化的，调用这个方法
  updateData: (data: any) => any
  controlPointMap: Record<string, { startCtrlPos: Ref<Point>; endCtrlPos: Ref<Point> }>
  theme: Ref<BezierTheme>
  crud: ReturnType<typeof useCurveCRUD> & ReturnType<typeof useFlagCRUD>
  switches: Ref<BezierSwitches>
  calcFuncs: Ref<CurveCalcs>
}
export const useSingleCurveInner = function ({ isMaster = false }: { isMaster?: boolean } = {}) {
  const exp = useCompExp<SingleInnerAPI>({ isMaster, key: 'bezierSingleInner' })

  const { registerFunc } = exp
  if (isMaster) {
    registerFunc({
      controlPointMap: {},
      pathFuncs: {},
    })
  }

  return { ...exp, polar2Rect, rect2Polar, screen2Cartesian, cartesian2Screen }
}

// 1条单曲线片段数据共享
export const useSeg = function ({ isMaster = false }: { isMaster?: boolean } = {}) {
  const exp = useCompExp<{
    startCtrlPos: Ref<Point>
    endCtrlPos: Ref<Point>
    index: Ref<number> // 当前线序号
  }>({ isMaster, key: 'bezierSegInner' })

  return { ...exp }
}
