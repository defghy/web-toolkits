// 标记点交互
import { type Ref, ref, nextTick } from 'vue'
import { Bezier, Point } from 'bezier-js'
import { throttle } from 'lodash-es'
import { $tinymsg, v4 } from '../../common'
import { BezierCurveInfo, BezierCurveSingle, FlagPoint } from '../../types'
import { WhenFuncs, WhenEvent } from '../../userInner/useEvent'
import { InnerAPI, SingleInnerAPI, useInner } from '../../userInner/useInner'

// flagPoint
export const useFlagCRUD = function ({
  flagPoints,
  funcs,
  singleFuncs,
}: {
  flagPoints: Ref<FlagPoint[]>
  funcs: InnerAPI
  singleFuncs: SingleInnerAPI
}) {
  // 按照鼠标位置，增加点
  const addFlagPointByPos = function ({ pos, key, type }: { pos?: Point; key?: string; type?: string } = {}) {
    const stage = funcs.getStage()
    // 没传位置，按照鼠标位置
    pos = pos || stage.getRelativePointerPosition()

    // 距离当前点击位置，最近的曲线上的点
    const { dim, utils } = singleFuncs.calcFuncs.value
    const { point: nearPoint } = utils.getNearByPos({ pos })
    const progressType = funcs.flagProgressType
    const progress = dim[progressType].point2Percent(pos)

    const newFlagPoint = {
      key: key || v4(),
      type: type || 'common',
      point: nearPoint,
      progressType,
      progress,
    } as FlagPoint
    singleFuncs.updateData({
      flagPoints: [...flagPoints.value, newFlagPoint],
    })

    funcs.whenCall(WhenEvent.afterFlagPointAdd, { curveId: singleFuncs.data.value.id, flagPoint: newFlagPoint })
  }

  // 移除目标点
  const delFlagPoint = function (key: string) {
    singleFuncs.updateData({
      flagPoints: flagPoints.value.filter(point => point.key !== key),
    })

    funcs.whenCall(WhenEvent.afterFlagPointDel, { curveId: singleFuncs.data.value.id, flagPointKey: key })
  }

  return { addFlagPointByPos, delFlagPoint }
}

// 标记方法
export const useFlagPoint = function ({ singleFuncs }: { singleFuncs: SingleInnerAPI }) {
  const { calcFuncs } = singleFuncs

  // 根据当前曲线自适应标记点
  const autoAdjustFlagPoints = ({ flagPoints }: { flagPoints: FlagPoint[] }) => {
    if (!flagPoints.length) {
      return
    }
    const newFlagPoints = flagPoints.map(flagPoint => {
      const { progress, progressType } = flagPoint
      const calcEngine = calcFuncs.value.dim[progressType]
      const newPoint = calcEngine.percent2Point(progress)

      return {
        ...flagPoint,
        point: newPoint,
      }
    })
    singleFuncs.updateData({
      flagPoints: newFlagPoints,
    })
  }

  const autoAdjustFlagPointsDelay = throttle(autoAdjustFlagPoints, 50)

  // 修改flagPoint
  const changeFlagPoint = function ({ newFlagPoint }) {
    const newFlagPoints = singleFuncs.data.value.flagPoints.map(flagPoint => {
      if (flagPoint.key === newFlagPoint.key) {
        return newFlagPoint
      }
      return flagPoint
    })
    singleFuncs.updateData({
      flagPoints: newFlagPoints,
    })
  }

  return {
    autoAdjustFlagPoints,
    autoAdjustFlagPointsDelay: async function (...args) {
      await nextTick() // change事件不是马上生效，此时同时触发flag修改会触发旧值改动
      autoAdjustFlagPointsDelay(...args)
    },
    changeFlagPoint,
  }
}
