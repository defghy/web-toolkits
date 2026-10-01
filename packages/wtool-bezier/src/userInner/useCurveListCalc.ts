import { type Ref, onScopeDispose, ref, computed, watch } from 'vue'
import { isEqual, cloneDeep } from 'lodash-es'
import { Bezier } from 'bezier-js'
import Konva from 'konva'
import { BezierCurveInfo, ControlPoint, Point } from '../types'
import { polar2Rect } from '../utils/utils'

// 多段曲线：坐标计算，分段进度；不依赖ui
export const useCurveListCalc = function <T extends BezierCurveInfo>({ curves }: { curves: Ref<T[]> }) {
  // 单调递增
  const isMonotonicIncreasing = function (axis?: keyof Point) {
    const axes = axis ? [axis] : (['x', 'y'] as (keyof Point)[])
    return axes.every(a => isAxisMonotonicIncreasing(curves.value, a))
  }

  // 不重复进行计算
  let cache = {
    curves: null as T[],
    data: null as CurveCalcs,
  }
  // 获取曲线相关计算方法
  const calcFuncs = computed(() => {
    if (isEqual(curves.value, cache.curves) && cache.data) {
      return cache.data
    }

    const { dim, utils } = makeCurveListFuncs({ curves: curves.value })
    Object.assign(cache, {
      curves: cloneDeep(curves.value),
      data: { dim, utils },
    })
    return cache.data
  })

  return {
    calcFuncs,
    makeCurveListFuncs,
    isMonotonicIncreasing,
    randomDisturbCurves: ({ randomDisturb }) => randomDisturbCurves({ curves: curves.value, randomDisturb }),
  }
}

// 轴x上是否单调递增
const isAxisMonotonicIncreasing = function (curves: BezierCurveInfo[], axis: keyof Point) {
  return curves.every((curve, index) => {
    const epsilon = 1e-8
    const { startCtrlPos, endCtrlPos } = getControlPointsPos(curve)
    const points = [curve.start, startCtrlPos, endCtrlPos, curve.end]
    const [p0, p1, p2, p3] = points.map(point => point[axis])
    const a = -p0 + 3 * p1 - 3 * p2 + p3
    const b = 2 * (p0 - 2 * p1 + p2)
    const c = p1 - p0
    const derivativeValues = [c, a + b + c]

    if (Math.abs(a) > epsilon) {
      const turningPoint = -b / (2 * a)
      if (turningPoint > 0 && turningPoint < 1) {
        derivativeValues.push(a * turningPoint ** 2 + b * turningPoint + c)
      }
    }

    const prevCurve = curves[index - 1]
    const followsPreviousCurve = !prevCurve || curve.start[axis] >= prevCurve.end[axis] - epsilon
    return followsPreviousCurve && derivativeValues.every(value => value >= -epsilon)
  })
}

// 生成曲线段阶梯数据：长度/x/y
interface CurveDimStepData {
  val: number // 当前维度值
  pre?: number // 之前线段累积的值
  milestone?: number // 当前线段达到的百分比
  total?: number
}
interface CurveStepInfo {
  id: string
  curve: BezierCurveInfo
  dimLen?: CurveDimStepData
  dimX?: CurveDimStepData
  dimY?: CurveDimStepData
  getPath: () => Konva.Path
  getBezier: () => Bezier
}
interface CurvesStepData {
  total: {
    dimLen?: number
    dimX?: number
    dimY?: number
  }
  curveInfos: CurveStepInfo[]
  curveMap: Record<string, CurveStepInfo>
}
// 不同维度下，计算方法
const makeCurveDim = function ({
  curvesStep,
  curveUtils,
}: {
  curvesStep: CurvesStepData
  curveUtils: ReturnType<typeof makeCurveUtils>
}) {
  const initStepAxis = function (axis: 'x' | 'y') {
    const dimKey = { x: 'dimX', y: 'dimY' }[axis]
    // 不重复生成
    if (Reflect.has(curvesStep.total, dimKey)) {
      return
    }
    const allStart = curvesStep.curveInfos[0].curve.start[axis]
    const total = curvesStep.curveInfos.at(-1).curve.end[axis] - allStart
    curvesStep.total[dimKey] = total
    curvesStep.curveInfos.forEach(info => {
      const { start, end } = info.curve

      info[dimKey] = {
        val: start[axis] - allStart,
        pre: start[axis] - allStart,
        total,
        milestone: (end[axis] - allStart) / total,
      }
    })
  }
  // 根据轴比例，获取点
  const percent2PointAxis = function (axis, progress) {
    const { curveInfos, total } = curvesStep
    // 找到当前在哪条曲线上
    const dimKey = { x: 'dimX', y: 'dimY' }[axis]
    const val = curveInfos[0].curve.start[axis] + total[dimKey] * progress

    return curveUtils.getPointByAxis({ axis, val })
  }
  const point2PercentAxis = function (axis, point) {
    const { curveInfos, total } = curvesStep
    const dimKey = { x: 'dimX', y: 'dimY' }[axis]
    const { point: nearPoint } = curveUtils.getNearByPos({ pos: point })
    const allStart = curveInfos[0].curve.start[axis]

    return +((nearPoint[axis] - allStart) / total[dimKey]).toFixed(4)
  }

  const curveDim: Record<
    string,
    {
      initStep: () => any
      percent2Point?: (progress: number) => Point
      point2Percent?: (point: Point) => number
    }
  > = {
    // 线长，
    len: {
      // 生成线上必要的阶梯数据
      initStep() {
        const curveStepData = curvesStep
        // 不重复生成
        if (Reflect.has(curveStepData.total, 'dimLen')) {
          return
        }
        let totalLen = 0 // 线总长度
        curveStepData.curveInfos.forEach(info => {
          const konvaPath = info.getPath()
          const currLen = konvaPath.getLength()
          const preLen = totalLen
          totalLen += currLen

          info.dimLen = {
            val: currLen,
            pre: preLen,
          }
        })
        curveStepData.total.dimLen = totalLen
        curveStepData.curveInfos.forEach(info => {
          const { pre: preLen, val: len } = info.dimLen
          Object.assign(info.dimLen, {
            total: totalLen,
            milestone: (preLen + len) / totalLen, // 当前曲线占用的百分比
          })
        })
      },
      percent2Point(progress) {
        this.initStep()
        const { curveInfos, total } = curvesStep
        // 找到当前在哪条曲线上
        const targetInfo = curveInfos.find(info => info.dimLen.milestone >= progress)
        const targetPath = targetInfo.getPath()
        const dimData = targetInfo.dimLen
        // 计算准确坐标
        const currPoint = targetPath.getPointAtLength(dimData.total * progress - dimData.pre)
        return currPoint
      },
      point2Percent(point) {
        this.initStep()
        const { total } = curvesStep
        // 找到精确的点，和线段。用这个计算百分比
        const { curveInfo, point: nearPoint } = curveUtils.getNearByPos({ pos: point })
        const bezier = curveInfo.getBezier()

        const currLen = bezier.split(nearPoint.t).left.length()

        return +((curveInfo.dimLen.pre + currLen) / total.dimLen).toFixed(4)
      },
    },
    x: {
      initStep() {
        initStepAxis('x')
      },
      percent2Point(progress) {
        this.initStep()
        return percent2PointAxis('x', progress)
      },
      point2Percent(point) {
        this.initStep()
        return point2PercentAxis('x', point)
      },
    },
    y: {
      initStep() {
        initStepAxis('y')
      },
      percent2Point(progress) {
        this.initStep()
        return percent2PointAxis('y', progress)
      },
      point2Percent(point) {
        this.initStep()
        return point2PercentAxis('y', point)
      },
    },
  }

  return curveDim
}
// 通用计算方法
const makeCurveUtils = function ({ curvesStep }: { curvesStep: CurvesStepData }) {
  const { curveMap } = curvesStep

  // 获取bezier工具
  const getBezier = function (id) {
    const bezier = curveMap[id]?.getBezier()
    return bezier
  }

  // 给定一个位置，找到这个位置所在的线段，以及其在线段上的对应点
  const getNearByPos = function ({ pos }: { pos: Point }) {
    const { curveInfos } = curvesStep
    let min = Number.MAX_SAFE_INTEGER
    let target
    curveInfos
      .map(curveInfo => {
        const bezier = curveInfo.getBezier()
        return {
          curveInfo,
          projection: bezier.project(pos),
        }
      })
      .forEach(item => {
        if (item.projection.d < min) {
          min = item.projection.d
          target = item
        }
      })

    return {
      curveInfo: target.curveInfo,
      point: target.projection,
    }
  }

  // 单调曲线，给定x或者y，可以获取线上的点
  const getPointByAxis = function ({ axis, val }: { axis: 'x' | 'y'; val: number }) {
    const { curveInfos, total } = curvesStep
    const dimKey = { x: 'dimX', y: 'dimY' }[axis]
    const dimVal = total[dimKey]
    const allStart = curveInfos[0].curve.start[axis]
    const progress = (val - allStart) / dimVal
    const targetInfo = curveInfos.find(info => info[dimKey].milestone >= progress)
    const bezier = targetInfo.getBezier()
    const epsilon = 1e-8
    if (Math.abs(val - targetInfo.curve.start[axis]) <= epsilon) {
      return bezier.get(0)
    }
    if (Math.abs(val - targetInfo.curve.end[axis]) <= epsilon) {
      return bezier.get(1)
    }

    const bbox = bezier.bbox()
    // 使用竖线与曲线求交，单调曲线只会得到一个交点
    const [t] = bezier.intersects(
      axis === 'x'
        ? {
            p1: { x: val, y: bbox.y.min - 1 },
            p2: { x: val, y: bbox.y.max + 1 },
          }
        : {
            p1: { x: bbox.x.min - 1, y: val },
            p2: { x: bbox.x.max + 1, y: val },
          }
    )

    return t === undefined ? null : bezier.get(+t)
  }

  return {
    getBezier,
    getNearByPos,
    getPointByAxis,
  }
}

export const makeCurveListFuncs = function ({ curves }: { curves: BezierCurveInfo[] }) {
  const curveInfos = curves.map(curve => {
    const konvaPath = getCurvePath(curve)
    const bezier = getCurveBezier(curve)

    return {
      id: curve.id,
      curve,
      getPath: () => konvaPath,
      getBezier: () => bezier,
    }
  })
  const curveMap = Object.fromEntries(curveInfos.map(info => [info.id, info]))

  const curvesStep = { curveInfos, curveMap, total: {} }
  const curveUtils = makeCurveUtils({ curvesStep })
  const curveDim = makeCurveDim({ curvesStep, curveUtils })

  return { ...curvesStep, dim: curveDim, utils: curveUtils }
}
export type CurveCalcs = ReturnType<typeof makeCurveListFuncs>

const getCurveBezier = function (curve: BezierCurveInfo) {
  const { startCtrlPos, endCtrlPos } = getControlPointsPos(curve)
  return new Bezier(
    curve.start.x,
    curve.start.y,
    startCtrlPos.x,
    startCtrlPos.y,
    endCtrlPos.x,
    endCtrlPos.y,
    curve.end.x,
    curve.end.y
  )
}

// 需要使用Path的一些api，不依赖ui，不知道性能如何。直接从组件获取Path实例速度快，但是复杂度较高
const getCurvePath = function (curve: BezierCurveInfo) {
  const printPoint = (point: Point) => `${point.x} ${point.y}`
  const { startCtrlPos, endCtrlPos } = getControlPointsPos(curve)
  const data = `M${printPoint(curve.start)} C ${printPoint(startCtrlPos)}, ${printPoint(endCtrlPos)}, ${printPoint(
    curve.end
  )}`
  return new Konva.Path({ data })
}

// 控制点极坐标 => 平面坐标
const getControlPointsPos = function (curve: BezierCurveInfo) {
  return {
    startCtrlPos: getControlPointPos({ controlPoint: curve.startCtrl, originPoint: curve.start }),
    endCtrlPos: getControlPointPos({ controlPoint: curve.endCtrl, originPoint: curve.end }),
  }
}
const getControlPointPos = function ({
  controlPoint,
  originPoint,
}: {
  controlPoint: Point | ControlPoint
  originPoint: Point
}) {
  if ('magnitude' in controlPoint && 'angle' in controlPoint) {
    return polar2Rect({ ...controlPoint, originPoint })
  }
  return controlPoint
}

// 随机扰动，ai生成
export const randomDisturbCurves = function ({
  curves,
  randomDisturb,
}: {
  curves: BezierCurveInfo[]
  randomDisturb: number
}) {
  const normalizedDisturb = randomDisturb / 100

  // 对极坐标控制点进行随机扰动
  const disturbControlPoint = (ctrl: BezierCurveInfo['startCtrl'], origin: { x: number; y: number }) => {
    // 用坐标量级作为 factor，保证偏移肉眼可见
    const factor = Math.max(Math.abs(origin.x), Math.abs(origin.y), 50)
    const magnitudeOffset = normalizedDisturb * factor * 0.3 * (Math.random() * 2 - 1)
    const angleOffset = normalizedDisturb * (Math.PI / 4) * (Math.random() * 2 - 1)
    return {
      magnitude: Math.max(0, ctrl.magnitude + magnitudeOffset),
      angle: ctrl.angle + angleOffset,
    }
  }

  const newCurves = curves.map(curve => ({
    ...curve,
    startCtrl: disturbControlPoint(curve.startCtrl, curve.start),
    endCtrl: disturbControlPoint(curve.endCtrl, curve.end),
  }))

  return newCurves
}
