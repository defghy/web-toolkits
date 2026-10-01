import { $tinymsg } from '../common'
import { BezierEditMode, BezierModeConfig } from '../types'

export const easingCurveMode = function ({ modeAdd, modeDel, modeCommon, funcs, selectSingle }) {
  // 缓动模式，不支持在线外增加控制点
  const modeEasingAdd = {
    ...modeAdd,
    onStageClick: undefined,
  } as BezierModeConfig

  // 缓动模式只删除控制点或连接点，不直接删除整段曲线
  const modeEasingDel = {
    onEnter: modeDel.onEnter,
    onControlPointClick({ singleFuncs, originPoint, index, ...args }) {
      const curves = singleFuncs.bezierCurves.value
      if (originPoint === curves[0].start) {
        return $tinymsg.error('起点不能删除')
      }
      if (originPoint === curves.at(-1).end) {
        return $tinymsg.error('终点不能删除')
      }
      if (index === curves.length - 1) {
        index--
      }
      singleFuncs.crud.delEdPoint({ point: originPoint, index })
    },
    onEdPointClick({ singleFuncs, index, ...args }) {
      singleFuncs.crud.delEdPoint({ index, ...args })
    },
  } as BezierModeConfig

  return {
    [BezierEditMode.easingAdd]: modeEasingAdd,
    [BezierEditMode.easingDel]: modeEasingDel,
  }
}
