// 一些交互中状态保存
import { ref, set, computed, Ref } from 'vue'
import { merge } from 'lodash-es'

import { BezierEditMode, BezierCurveInfo, CurveUEState, BezierModeConfig } from '../types'
import { InnerAPI, SingleInnerAPI } from './useInner'

// 编辑模式切换
export const useEditMode = function ({ funcs, isEasing = false }: { funcs: InnerAPI; isEasing?: boolean }) {
  const { ueState, modeAdd, modeDel, modeCommon, op, customModeDict } = useModes({
    funcs,
  })

  // 当前编辑模式
  const currEditMode = ref<BezierEditMode>(BezierEditMode.common)

  const editModeDict = merge(
    {
      [BezierEditMode.common]: modeCommon,
      [BezierEditMode.add]: modeAdd,
      [BezierEditMode.del]: modeDel,
    },
    customModeDict
  ) as Record<string, BezierModeConfig>
  const currMode = computed(() => editModeDict[currEditMode.value])

  // 进入模式
  const enterMode = function (newMode: BezierEditMode) {
    currEditMode.value = newMode
    document.addEventListener('pointerdown', rightClickExitMode)
    currMode.value.onEnter?.()
  }
  // 取消模式
  const rightClickExitMode = function (evt: PointerEvent) {
    // 右键点击；点击canvas区域外 = 取消选择
    if (evt.button !== 2) {
      const canvasList = funcs
        .getStage()
        ?.getLayers()
        .map(layer => layer.getNativeCanvasElement())
      if (canvasList?.find(canvas => evt.target === canvas)) {
        return
      }
    }

    exitMode()
  }
  const exitMode = function () {
    if (currEditMode.value === BezierEditMode.common) {
      return
    }
    editModeDict[currEditMode.value]?.onExit?.()
    currEditMode.value = BezierEditMode.common
    funcs.updateCursor('')
    document.removeEventListener('pointerdown', rightClickExitMode)
  }

  const toggleMode = function (targetMode: BezierEditMode) {
    if (!currEditMode.value) {
      return enterMode(targetMode)
    }

    // 切换mode
    if (currEditMode.value !== targetMode) {
      exitMode()
      enterMode(targetMode)
      return
    }

    exitMode()
  }

  function getMode() {
    return editModeDict[currEditMode.value] || null
  }

  // 使用生命周期来实现交互
  funcs.when({
    onStageClick({ evt, funcs }) {
      return getMode()?.onStageClick?.({ evt, funcs })
    },
    onSegCurveEnter(...args) {
      return getMode()?.onSegCurveEnter?.(...args)
    },
    onSegCurveLeave(...args) {
      return getMode()?.onSegCurveLeave?.(...args)
    },
    onSegCurveClick(...args) {
      return getMode()?.onSegCurveClick?.(...args)
    },
    onControlPointClick(...args) {
      return getMode()?.onControlPointClick?.(...args)
    },
    onEdPointClick(...args) {
      return getMode()?.onEdPointClick?.(...args)
    },
    onFlagPointClick(...args) {
      return getMode()?.onFlagPointClick?.(...args)
    },
  })

  return {
    ueState,
    currEditMode,
    toggleMode,
    getMode,
    op,
  }
}

const useModes = function ({ funcs }: { funcs: InnerAPI }) {
  const ueState = ref<CurveUEState>({
    grpCurve: {
      hovered: null,
      selected: null,
      themes: {},
    },
    segCurve: {
      hovered: null,
      themes: {},
    },
  })

  const op = useCurveOp({ ueState, funcs })
  const selectSingle = function ({ singleFuncs }) {
    if (!singleFuncs.switches.value.canSelect) return
    const grpCurveId = singleFuncs.data.value.id
    op.selectGrpCurve(grpCurveId)
    funcs.whenCall(funcs.WhenEvent.onGrpCurveSelected, { grpCurveId, funcs, singleFuncs })
  }

  const modeCommon = {
    onSegCurveEnter({ grpCurveId, funcs, singleFuncs }) {
      if (!singleFuncs.switches.value.canSelect) return
      ueState.value.grpCurve.hovered = grpCurveId
      // 设置曲线颜色
      funcs.updateCursor('pointer')
      op.hoverGrpCurve(grpCurveId, true)
    },
    onSegCurveLeave({ singleFuncs, grpCurveId }) {
      if (!singleFuncs.switches.value.canSelect) return
      ueState.value.grpCurve.hovered = null
      funcs.updateCursor('')
      op.hoverGrpCurve(grpCurveId, false)
    },
    onSegCurveClick({ singleFuncs, ...args }) {
      selectSingle({ singleFuncs })
    },
  } as BezierModeConfig

  const modeAdd = {
    onEnter() {
      funcs.updateCursor('cell')
    },
    onSegCurveEnter({ segCurveId, grpCurveId }) {
      ueState.value.segCurve.hovered = segCurveId
      ueState.value.grpCurve.hovered = grpCurveId
      // 设置曲线颜色
      set(ueState.value.segCurve.themes, segCurveId, { ...funcs.theme.spec.add })
    },
    onSegCurveLeave({ segCurveId }) {
      ueState.value.segCurve.hovered = null
      ueState.value.grpCurve.hovered = null
      ueState.value.segCurve.themes[segCurveId] = null
    },
    onStageClick: function () {
      // 选中的线响应
      const singleFuncs = funcs.singleFuncsMap[ueState.value.grpCurve.selected]
      if (!singleFuncs) {
        return
      }
      singleFuncs.crud.appendCurve()
    },
    onSegCurveClick({ singleFuncs, ...args }) {
      selectSingle({ singleFuncs })
      singleFuncs.crud.splitCurve(args)
    },
  } as BezierModeConfig

  const modeDel = {
    onEnter() {
      funcs.updateCursor('move')
    },
    onSegCurveEnter({ segCurveId, grpCurveId, singleFuncs }) {
      ueState.value.segCurve.hovered = segCurveId
      ueState.value.grpCurve.hovered = grpCurveId
      // 设置曲线颜色
      set(ueState.value.segCurve.themes, segCurveId, { ...funcs.theme.spec.remove })
    },
    onSegCurveLeave({ segCurveId, grpCurveId, singleFuncs }) {
      ueState.value.segCurve.hovered = null
      ueState.value.grpCurve.hovered = null
      ueState.value.segCurve.themes[segCurveId] = {}
    },
    onSegCurveClick({ singleFuncs, ...args }) {
      singleFuncs.crud.delByCurve(args)
    },
    onControlPointClick({ singleFuncs, ...args }) {
      singleFuncs.crud.delByControlPoint(args)
    },
    onEdPointClick({ singleFuncs, ...args }) {
      singleFuncs.crud.delByEdPoint(args)
    },
  } as BezierModeConfig

  // 注册自定义mode
  let customModeDict = {}
  const customModes = funcs.plugins.map(plugin => plugin.registerMode).filter(Boolean)
  customModes.forEach(makeMode =>
    merge(customModeDict, makeMode({ modeAdd, modeDel, modeCommon, funcs, selectSingle }))
  )

  return { ueState, modeAdd, modeDel, modeCommon, op, customModeDict }
}

// 交互处理
const useCurveOp = function ({ ueState, funcs }: { ueState: Ref<CurveUEState>; funcs: InnerAPI }) {
  // 刷新曲线样式
  const freshGrpStyle = function (id) {
    const { theme } = funcs
    const { hovered, selected, themes } = ueState.value.grpCurve
    let style = null
    if (hovered === id) {
      style = { ...theme.spec.hovered }
    } else if (selected === id) {
      style = { ...theme.spec.selected }
    }
    set(themes, id, style)
  }

  const selectGrpCurve = function (newId) {
    const { grpCurve } = ueState.value
    const { selected: oldId, themes } = grpCurve
    grpCurve.selected = newId
    freshGrpStyle(oldId)
    freshGrpStyle(newId)
  }

  const hoverGrpCurve = function (id, isHover) {
    const { grpCurve } = ueState.value
    grpCurve.hovered = isHover ? id : null
    freshGrpStyle(id)
  }

  return { selectGrpCurve, hoverGrpCurve }
}
