import type { InnerAPI, SingleInnerAPI } from './userInner'
import type { WhenFuncs } from './userInner/useEvent'
export interface Point {
  x: number
  y: number
}

export interface NumRange {
  min?: number
  max?: number
}

export interface ControlPoint {
  // 极坐标
  magnitude: number
  angle: number
  // 衍生
  x?: number
  y?: number
}
// 标记点
export interface FlagPoint {
  key: string
  type: 'common' | 'extreme' // 极值点
  point: Point // 具体点坐标
  progressType?: 'len' | 'x' | 'y' // 进度类型可能不同
  progress?: number // 整条曲线累计进度；当曲线发生变化，使用progress进行标记自适应
}

export interface BezierCurveInfo {
  id: string
  start: Point
  end: Point
  startCtrl: ControlPoint
  endCtrl: ControlPoint
}
export interface BezierCurveModel {
  id?: string
  start: Point
  end: Point
  startCtrl: Point
  endCtrl: Point
}

// 1条线由多个部分组成
export type BezierSwitches = {
  showEdStart?: boolean | ((args: { index: number; info: BezierCurveInfo }) => boolean) // 是否显示 端点
  showEdEnd?: boolean | ((args: { index: number; info: BezierCurveInfo }) => boolean) // 是否显示 终点
  showControlPoint?: boolean | ((args: { index: number; info: BezierCurveInfo }) => boolean) // 是否展示控制点
  canSelect?: boolean // 是否可以被选中
  canDelete?: boolean // 线是否可被删除
}
export interface BezierCurveSingle {
  id: string
  curveSegs: BezierCurveModel[]
  hide?: boolean // 是否可见
  trail?: {
    enable?: boolean // 启用小球动画
    cycle?: boolean // 循环播放
  }
  easingData?: { type: any; data?: any; duration: number }
  owner?: string | '__shared__'
  switches?: BezierSwitches

  // 标记点
  flagPoints?: FlagPoint[]
}

export enum BezierEditMode {
  common = 'common', // 常规模式
  add = 'add',
  flag = 'flag', // 新增标记点
  del = 'del',
  fitting = 'fitting', // 新增拟合线

  // 缓动
  easingAdd = 'easingAdd',
  easingDel = 'easingDel',
}

export interface BezierModeConfig extends Partial<WhenFuncs> {
  cursor?: string
  colors?: any
  onEnter?: Function
  onExit?: Function
}

export interface PointRange {
  x?: NumRange
  y?: NumRange
}
export interface BezierConfig {
  range?: {
    startCtrl?: PointRange
    endCtrl?: PointRange
  }
}

export interface CurveUEState {
  grpCurve: {
    hovered: string | null
    selected: string | null
    themes: any
  }
  segCurve: {
    hovered: string | null
    themes: any
  }
}

export interface BackImgInfo {
  url: string
  scale: number
  x: number
  y: number
  opacity: number
}

// 线构成组件名
export enum CurveWidgetType {
  curve = 'curve', // 曲线
  edPoint = 'edPoint', // 端点
  controlLine = 'controlLine', // 控制虚线
  controlPoint = 'controlPoint', // 控制点
  flagPoint = 'flagPoint', // 标记点
}

export interface BezierPlugin {
  components?: {
    inCurve?: any // 曲线上组件
  }
  registerMode?: (args: {
    modeAdd: BezierModeConfig
    modeDel: BezierModeConfig
    modeCommon: BezierModeConfig
    funcs: InnerAPI
    selectSingle: Function
  }) => any
}
