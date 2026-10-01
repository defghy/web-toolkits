import { type Ref } from 'vue'
import BezierEditor from './BezierEditor.vue'
import { BezierEditMode } from './types'
import { WhenFunc } from './userInner/useEvent'

// 组件对外提供的api
export const useBezier = function ({ comp }: { comp: Ref<InstanceType<typeof BezierEditor>> }) {
  const toggleMode = function (mode: BezierEditMode) {
    return comp.value.toggleMode(mode)
  }

  const getEditMode = () => comp.value?.currEditMode

  const centerAndFitbackImg = () => comp.value?.funcs.centerAndFitImg()

  const ueUtilGet = () => comp.value?.ueUtil

  const when: WhenFunc = function (...args) {
    if (!comp.value) {
      return console.error('curve未初始化，无法when')
    }
    return comp.value?.funcs.when(...args)
  }

  // hover/select 曲线
  const hoverGrpCurve: typeof comp.value.op.hoverGrpCurve = (...args) => comp.value?.op.hoverGrpCurve(...args)
  const selectGrpCurve: typeof comp.value.op.selectGrpCurve = (...args) => comp.value?.op.selectGrpCurve(...args)

  const travel = {
    start(params?: { randomStart?: number; randomDisturb?: number }) {
      const { funcs } = comp.value || {}
      return funcs?.whenCall(funcs?.WhenEvent.travelStart, params)
    },
    pause() {
      const { funcs } = comp.value || {}
      return funcs?.whenCall(funcs?.WhenEvent.travelPause)
    },
    resume() {
      const { funcs } = comp.value || {}
      return funcs?.whenCall(funcs?.WhenEvent.travelResume)
    },
    stop() {
      const { funcs } = comp.value || {}
      return funcs?.whenCall(funcs?.WhenEvent.travelStop)
    },
  }

  // 获取曲线的方法
  const getSingleFuncs = function (id: string) {
    const { funcs } = comp.value || {}
    return funcs.singleFuncsMap[id]
  }

  return {
    travel, // 观看运动轨迹
    getEditMode, // 当前所在模式
    toggleMode, // 切换编辑模式
    centerAndFitbackImg,
    ueUtilGet,
    when,
    hoverGrpCurve,
    selectGrpCurve,
    getSingleFuncs,
  }
}
