import { reactive, Ref, onMounted, shallowRef, nextTick, provide, inject, toRefs, onBeforeUnmount } from 'vue'
import type Konva from 'konva'
import { merge, isEmpty, cloneDeep } from 'lodash-es'

import type { InnerFunc, InnerAPI, SingleInnerAPI } from './useInner'
import { BezierCurveInfo, Point, ControlPoint, FlagPoint } from '../types'

export const WhenEvent = {
  onStageClick: 'onStageClick',
  onSegCurveEnter: 'onSegCurveEnter',
  onSegCurveLeave: 'onSegCurveLeave',
  onSegCurveClick: 'onSegCurveClick',
  onControlPointClick: 'onControlPointClick',
  onEdPointClick: 'onEdPointClick',
  onFlagPointClick: 'onFlagPointClick',
  onGrpCurveSelected: 'onGrpCurveSelected',
  onCurveUpdated: 'onCurveUpdated',

  travelStart: 'travelStart',
  travelPause: 'travelPause',
  travelResume: 'travelResume',
  travelStop: 'travelStop',
  afterFlagPointAdd: 'afterFlagPointAdd',
  afterFlagPointDel: 'afterFlagPointDel',
} as const
export type WhenEvent = (typeof WhenEvent)[keyof typeof WhenEvent]

interface WhenCommonParams {
  funcs: InnerAPI
  singleFuncs: SingleInnerAPI
}
export interface WhenFuncs {
  [WhenEvent.onStageClick]: (args: { evt: PointerEvent; funcs: InnerAPI }) => any
  [WhenEvent.onSegCurveEnter]: (args: { segCurveId: string; grpCurveId: string } & WhenCommonParams) => any
  [WhenEvent.onSegCurveLeave]: (args: { segCurveId: string; grpCurveId: string } & WhenCommonParams) => any
  [WhenEvent.onSegCurveClick]: (
    args: {
      curveInfo: BezierCurveInfo
      index: number
      startCtrlPos: Point
      endCtrlPos: Point
      singleFuncs: SingleInnerAPI
    } & WhenCommonParams
  ) => any
  [WhenEvent.onControlPointClick]: (
    args: { point: ControlPoint; originPoint: Point; index: number } & WhenCommonParams
  ) => any
  [WhenEvent.onEdPointClick]?: (args: { point: Point; index: number } & WhenCommonParams) => any
  [WhenEvent.onFlagPointClick]: (
    args: { flagPoint: FlagPoint; event: Konva.KonvaEventObject<PointerEvent> } & WhenCommonParams
  ) => any
  [WhenEvent.onCurveUpdated]: (args: {} & WhenCommonParams) => any

  // 外部事件
  [WhenEvent.onGrpCurveSelected]?: (args: { grpCurveId: string } & WhenCommonParams) => any
  [WhenEvent.travelStart]: (params?: { randomStart?: number; randomDisturb?: number }) => any // 触发小球动画
  [WhenEvent.travelPause]: () => any
  [WhenEvent.travelResume]: () => any
  [WhenEvent.travelStop]: () => any
  [WhenEvent.afterFlagPointAdd]: (args: { curveId: string; flagPoint: FlagPoint }) => any
  [WhenEvent.afterFlagPointDel]: (args: { curveId: string; flagPointKey: string }) => any
  [key: string]: any
}
type BezierWhenData = {
  [K in keyof WhenFuncs]: WhenFuncs[K][]
}

const defaultWhen = Object.fromEntries(Object.entries(WhenEvent).map(([key, val]) => [val, []])) as BezierWhenData

type WhenSetData = {
  [K in keyof BezierWhenData]: BezierWhenData[K] extends (infer U)[] ? U : never
}

export type WhenCall = <T extends keyof BezierWhenData>(
  key: T | string,
  ...data: Parameters<BezierWhenData[T][number]>
) => any
export type WhenFunc = (args: Partial<WhenSetData>) => any

// 用于组件内部使用
export const useEventMaster = function ({ exp }: { exp: InnerFunc }) {
  const { registerFunc, funcs } = exp

  const call: WhenCall = function (key, ...data) {
    const pixelWhen = funcs.whenCallbacks
    const handlers = pixelWhen[key]
    return handlers?.map(handler => {
      return handler(...data)
    })
  }

  registerFunc({
    whenCallbacks: cloneDeep(defaultWhen),
    whenCall: call,
  })
}

export const useWhen = function ({ getFuncs }: { getFuncs: () => InnerAPI }) {
  const unbinds = []
  const when = async function (cfg: Partial<WhenSetData>) {
    let funcs = getFuncs()
    if (!funcs?.whenCallbacks) {
      await nextTick()
    }
    funcs = getFuncs()
    const pixelWhen = funcs?.whenCallbacks
    Object.entries(cfg).forEach(([key, func]) => {
      pixelWhen[key] = pixelWhen[key] || []
      const target = pixelWhen[key]
      if (!target.includes(func)) {
        target.push(func)
      }
    })
    // 卸载方法
    const unbind = () => {
      Object.entries(cfg).forEach(([key, func]) => {
        const target = pixelWhen[key]
        if (target.includes(func)) {
          pixelWhen[key] = target.filter(f => f !== func)
        }
      })
    }

    unbinds.push(unbind)

    return { unbind }
  }

  const whenUnbind = function (cfg: Partial<WhenSetData>) {
    let funcs = getFuncs()
    const pixelWhen = funcs?.whenCallbacks
    Object.entries(cfg).forEach(([key, func]) => {
      const target = pixelWhen[key]
      if (target.includes(func)) {
        pixelWhen[key] = target.filter(f => f !== func)
      }
    })
  }

  onBeforeUnmount(() => {
    unbinds.forEach(func => func())
  })

  return { when, whenUnbind, WhenEvent }
}
