import { Ref, computed } from 'vue'
import { Konva } from '../../utils/konva'
import { BezierCurveInfo } from '../../types'
import { useInner, useSingleCurveInner } from '../../userInner'
import { useCurveListCalc, makeCurveListFuncs, randomDisturbCurves } from '../../userInner/useCurveListCalc'

// 运动动画逻辑
export const useTrial = function ({
  curves,
  easing,
  getBall,
  onTravelStart,
  onTravelEnd,
}: {
  curves: Ref<BezierCurveInfo[]>
  easing: Ref<{ type: EasingType; params?: any; duration: number }>
  getBall: () => Konva.Circle
  onTravelStart?: Function
  onTravelEnd?: Function
}) {
  const { funcs: singleFuncs } = useSingleCurveInner()
  const { calcFuncs: easingFuncs } = useCurveListCalc({ curves: computed(() => easing.value.params.curves) })

  // 开始动画
  const prepare = function ({ randomDisturb }) {
    let trackFuncs = singleFuncs.calcFuncs.value.dim
    // 扰动轨迹曲线
    if (randomDisturb) {
      const currCurves = randomDisturbCurves({ curves: curves.value, randomDisturb })
      trackFuncs = makeCurveListFuncs({ curves: currCurves }).dim as any
    }

    // 缓动函数
    const { duration } = easing.value

    return { trackCurveFuncs: trackFuncs, easingCurveFuncs: easingFuncs.value.dim, duration }
  }
  let isAnimating = false // 防止重复播放动画
  let isPaused = false
  let delayTimer: ReturnType<typeof setTimeout> | null = null
  let anim: Konva.Animation
  const startTravel = function (params?: { randomStart?: number; randomDisturb?: number }) {
    if (!curves.value?.length || isAnimating) {
      return
    }
    isAnimating = true

    const { trackCurveFuncs, easingCurveFuncs, duration } = prepare({
      randomDisturb: params?.randomDisturb ?? 0,
    })
    onTravelStart?.()
    // 从起点开始
    const ball = getBall()
    ball.position(curves.value[0].start)

    const randomStart = params?.randomStart ?? 0

    const runAnimation = function () {
      anim = new Konva.Animation(function (frame) {
        const timeProc = Math.min(frame.time / duration, 1)
        const progress = Math.min(easingCurveFuncs.x.percent2Point(timeProc).y, 1)

        // 计算准确坐标
        const currPoint = trackCurveFuncs.len.percent2Point(progress)
        ball.position(currPoint)

        if (progress > 0.999) {
          stopTravel()
        }
      }, ball.getLayer())

      anim.start()
    }

    runAnimation()

    // 随机开始间隔
    if (randomStart > 0) {
      anim.stop()
      const delayMs = Math.random() * randomStart * 1000
      delayTimer = setTimeout(() => {
        delayTimer = null
        if (isAnimating && !isPaused) {
          anim.start()
        }
      }, delayMs)
    }
  }

  const stopTravel = function (...args) {
    if (delayTimer) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
    anim?.stop()
    isAnimating = false
    isPaused = false
    onTravelEnd?.(...args)
  }

  const pauseTravel = function () {
    if (!isAnimating || isPaused) return
    anim.stop()
    isPaused = true
  }

  const resumeTravel = function () {
    if (!isPaused) return
    isPaused = false
    if (!delayTimer) {
      anim.start()
    }
  }

  const getIsPaused = () => isPaused

  return { startTravel, stopTravel, pauseTravel, resumeTravel, getIsPaused }
}

// 缓动类型
export enum EasingType {
  bezier = 'CustomBezier', // bezier cubic
  sinIn = 'sinIn',
}
