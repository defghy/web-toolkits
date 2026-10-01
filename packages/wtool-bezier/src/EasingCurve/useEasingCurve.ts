import { Ref } from 'vue'
import { BezierEditMode, Point } from '../types'
import EasingCurve from './EasingCurve.vue'
import { WhenFunc } from '../userInner'

const SideLength = 100 // 边长

export const useEasingCurve = function () {
  const pointTrans = {
    normalize(point: Point) {
      return {
        x: point.x / SideLength,
        y: point.y / SideLength,
      }
    },
    deNormalize(point: Point) {
      return {
        x: point.x * SideLength,
        y: point.y * SideLength,
      }
    },
  }

  return { SideLength, pointTrans }
}

// 缓动对外api
export const useEasingExp = function ({ comp }: { comp: Ref<InstanceType<typeof EasingCurve>> }) {
  const getTheme = function () {
    return comp.value?.funcs.theme
  }

  const toggleMode = function (mode: BezierEditMode) {
    return comp.value?.toggleMode(mode)
  }

  const getEditMode = function () {
    return comp.value?.currEditMode
  }

  const getSingleFuncs = function () {
    const { funcs } = comp.value
    // 缓动就1条线
    return Object.values(funcs.singleFuncsMap)[0]
  }

  const when: WhenFunc = function (...args) {
    if (!comp.value) {
      return console.error('curve未初始化，无法when')
    }
    return comp.value?.funcs.when(...args)
  }

  return { when, getTheme, toggleMode, getEditMode, getSingleFuncs }
}
