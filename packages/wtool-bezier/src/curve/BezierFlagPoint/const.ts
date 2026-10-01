import { BezierEditMode, BezierModeConfig } from '../../types'

// 标记点使用独立分类色，避免与所在曲线颜色混淆
export const flagPointColors = [
  '#6929c4',
  '#1192e8',
  '#005d5d',
  '#9f1853',
  '#fa4d56',
  '#570408',
  '#198038',
  '#002d9c',
  '#ee538b',
  '#b28600',
  '#009d9a',
  '#012749',
  '#8a3800',
  '#a56eff',
]

// 标记点操作注册
export const FlagPointMode = function ({ modeAdd, modeDel, modeCommon, funcs, selectSingle }) {
  const modeFlag = {
    onEnter() {
      funcs.updateCursor('crosshair')
    },
    onSegCurveEnter(args) {
      if (args.singleFuncs.data.value.owner) return
      modeAdd.onSegCurveEnter(args)
    },
    onSegCurveLeave(args) {
      if (args.singleFuncs.data.value.owner) return
      modeAdd.onSegCurveLeave(args)
    },
    onSegCurveClick({ singleFuncs, ...args }) {
      if (singleFuncs.data.value.owner) return
      selectSingle({ singleFuncs })
      singleFuncs.crud.addFlagPointByPos()
    },
  } as BezierModeConfig

  return {
    [BezierEditMode.common]: {
      onFlagPointClick({ singleFuncs }) {
        selectSingle({ singleFuncs })
      },
    },
    [BezierEditMode.del]: {
      onFlagPointClick({ singleFuncs, flagPoint, ...args }) {
        singleFuncs.crud.delFlagPoint?.(flagPoint.key)
      },
    },
    [BezierEditMode.easingDel]: {
      onFlagPointClick({ singleFuncs, flagPoint, ...args }) {
        singleFuncs.crud.delFlagPoint?.(flagPoint.key)
      },
    },
    [BezierEditMode.flag]: modeFlag,
  }
}
