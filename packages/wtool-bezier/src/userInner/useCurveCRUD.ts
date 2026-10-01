import { type Ref, ref } from 'vue'
import { Bezier, Point } from 'bezier-js'
import { $tinymsg, v4 } from '../common'
import { BezierCurveInfo, BezierEditMode, ControlPoint, FlagPoint } from '../types'
import { WhenFuncs, WhenEvent } from './useEvent'
import { coordUtil, createCurveInfo } from '../utils/utils'
import { InnerAPI, SingleInnerAPI } from './useInner'

// curve的增删改查逻辑
export const useCurveCRUD = function ({
  curves,
  funcs,
  singleFuncs,
}: {
  curves: Ref<BezierCurveInfo[]>
  funcs: InnerAPI
  singleFuncs: SingleInnerAPI
}) {
  // 不同模式配置
  const { appendCurve, onExitAdd, splitCurve } = useCurveAdd({
    curves,
    funcs,
    singleFuncs,
  })
  const delFuncs = useCurveDel({
    curves,
    funcs,
    singleFuncs,
  })

  return { appendCurve, splitCurve, ...delFuncs }
}

// 新增
export const useCurveAdd = function ({
  curves,
  funcs,
  singleFuncs,
}: {
  curves: Ref<BezierCurveInfo[]>
  funcs: InnerAPI
  singleFuncs: SingleInnerAPI
}) {
  const { updateCurve } = singleFuncs
  // 新增控制点
  let newCurve: BezierCurveInfo // 增加到一半的曲线

  // 线后追加1条线
  function appendCurve() {
    const { getStage, isLinear } = funcs
    const stage = getStage()
    const pos = stage.getRelativePointerPosition()
    const magnitude = 40 // 新增的周长
    // 控制angle在-pi和pi之间
    const { normalizeAngle } = coordUtil

    // 从起点开始新增
    const addFromStart = !curves.value.length || (!isLinear.value && !newCurve)
    if (addFromStart) {
      newCurve = createCurveInfo({
        start: pos,
        end: null,
        startCtrl: null,
        endCtrl: null,
      })
      return updateCurve(() => curves.value.push(newCurve))
    }

    // 补充终点和控制点
    if (newCurve) {
      newCurve.end = pos
      const { x: xDelta, y: yDelta } = coordUtil.sub(newCurve.start, newCurve.end)
      const angle = Math.atan2(yDelta, xDelta)
      newCurve.startCtrl = { magnitude, angle: normalizeAngle(angle + Math.PI / 2) }
      newCurve.endCtrl = { magnitude, angle: normalizeAngle(angle + Math.PI / 2) }
      // 新增完成，移除本次中间变量
      newCurve = null
      return
    }

    // 线之间进行连接
    const prevCurve = curves.value.at(-1)
    const nextCurve = createCurveInfo({
      start: prevCurve.end,
      end: pos,
      startCtrl: { magnitude, angle: normalizeAngle(prevCurve.endCtrl.angle + Math.PI) },
      endCtrl: { magnitude, angle: normalizeAngle(prevCurve.endCtrl.angle + Math.PI) },
    })
    updateCurve(() => curves.value.push(nextCurve))
  }
  function onExitAdd() {
    if (newCurve) {
      updateCurve(() => curves.value.pop())

      newCurve = null
    }
  }

  // 点击到线上时，分割曲线
  const splitCurve = ({
    curveInfo,
    index,
    startCtrlPos,
    endCtrlPos,
  }: Partial<Parameters<WhenFuncs['onSegCurveClick']>[0]>) => {
    const stage = funcs.getStage()
    const pointerPos = stage.getRelativePointerPosition()

    // 距离当前点击位置，最近的曲线上的点
    const bezierUtils = singleFuncs.calcFuncs.value.utils.getBezier(curveInfo.id)
    const nearPoint = bezierUtils.project(pointerPos)

    // 从这个点拆分2个曲线
    const { left, right } = bezierUtils.split(nearPoint.t)
    function makeNewPrevCurve() {
      const [, newStartCtrl, newEndCtrl, newEnd] = left.points
      const newStart = curveInfo.start

      return createCurveInfo({
        start: newStart,
        startCtrl: { ...coordUtil.rect2Polar({ origin: newStart, target: newStartCtrl }) },
        endCtrl: { ...coordUtil.rect2Polar({ origin: newEnd, target: newEndCtrl }) },
        end: newEnd,
      })
    }
    function makeNewNextCurve({ prevCurve }) {
      const [, newStartCtrl, newEndCtrl, newEnd] = right.points
      const newStart = prevCurve.end
      return createCurveInfo({
        start: newStart,
        startCtrl: { ...coordUtil.rect2Polar({ origin: newStart, target: newStartCtrl }) },
        endCtrl: { ...coordUtil.rect2Polar({ origin: newEnd, target: newEndCtrl }) },
        end: newEnd,
      })
    }
    // 分裂成2条曲线
    const newCurvePrev = makeNewPrevCurve()
    const newCurveNext = makeNewNextCurve({ prevCurve: newCurvePrev })

    // 修改数据
    updateCurve(() => curves.value.splice(index, 1, newCurvePrev, newCurveNext))
  }

  return { appendCurve, onExitAdd, splitCurve }
}

// 删除
export const useCurveDel = function ({
  curves,
  funcs,
  singleFuncs,
}: {
  curves: Ref<BezierCurveInfo[]>
  funcs: InnerAPI
  singleFuncs: SingleInnerAPI
}) {
  const deleteByIndex = function ({ index }) {
    // 删除最后一段
    if (!singleFuncs.switches.value.canDelete) {
      if (curves.value.length <= 1) {
        return $tinymsg.error('最后1段曲线无法删除')
      }
    }

    singleFuncs.updateCurve(() => curves.value.splice(index, 1))
  }

  // 控制点唯一确定一条曲线
  const delByControlPoint = function ({ point, index }) {
    deleteByIndex({ index })
  }

  // 点击曲线，删除唯一的曲线
  const delByCurve = function ({ curveInfo, index }) {
    deleteByIndex({ index })
  }

  // 删除线
  const delByEdPoint = function ({ point, index }) {
    const currCurve = curves.value[index]
    // 点击起点
    if (point === currCurve.start) {
      return deleteByIndex({ index })
    }

    // 点击终点，尝试删除后面的线，没有删除当前的线
    else {
      if (curves.value[index + 1]) {
        index += 1
      }
      return deleteByIndex({ index })
    }
  }

  // 删除连接点，前后2条线合并为1条。编号index的终点作为连接点
  const delEdPoint = function ({ point, index }) {
    const prevCurve = curves.value[index]
    const nextCurve = curves.value[index + 1]
    if (!prevCurve || !nextCurve) {
      return
    }

    const mergedCurve = createCurveInfo({
      start: prevCurve.start,
      startCtrl: prevCurve.startCtrl,
      endCtrl: nextCurve.endCtrl,
      end: nextCurve.end,
    })
    singleFuncs.updateCurve(() => curves.value.splice(index, 2, mergedCurve))
  }

  return { delByControlPoint, delByCurve, delByEdPoint, delEdPoint }
}
