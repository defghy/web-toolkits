import { type Ref } from 'vue'
import type Konva from 'konva'
import { useCompExp } from '@yuhufe/web-common'

import { PixelPaletteInst } from '../types'
import { type PixelWhenData, WhenCall, usePixEventMaster } from './useEvent'
import { useConfigMaster, UsePixelConfig } from './useConfig'
import { usePixFuncMaster } from './usePixFunc'

export interface InnerAPI {
  getStage: () => Konva.Stage
  pixelData: {
    get: () => Ref<PixelPaletteInst['pixelData']>
    set: (args: any) => void
  }
  renderFlags: { key: string; done: Promise<any>; resolve: Function }[]
  addRenderFlag: (key: string) => { resolve: Function }
  isRenderred: () => Promise<any>
  when: Partial<PixelWhenData>
  whenCall: WhenCall
  config: UsePixelConfig['config']
  setConfig: UsePixelConfig['setConfig']

  // 公共方法，对内对外
  centerAndPosition: Function
}
export type InnerFunc = ReturnType<typeof useCompExp<InnerAPI>>
export const useInner = function ({ isMaster = false }: { isMaster?: boolean } = {}) {
  const exp = useCompExp<InnerAPI>({ isMaster, key: 'pixArtEditor' })

  if (isMaster) {
    useConfigMaster({ exp })
    useRenderred({ exp })
    usePixEventMaster({ exp })
    usePixFuncMaster({ exp })
  }

  return { ...exp }
}

// 判断stage渲染完成，可能存在多个子组件有自己的渲染逻辑，需要所有渲染完成才能resolve
const useRenderred = function ({ exp }: { exp: InnerFunc }) {
  const { registerFunc, funcs } = exp

  const makeResolver = function () {
    let resolve!: Function
    const done = new Promise<any>(r => {
      resolve = r
    })
    return { resolve, done }
  }

  const addRenderFlag = function (key: string) {
    const renderFlags = funcs.renderFlags
    const idx = renderFlags.findIndex(f => f.key === key)
    if (idx >= 0) {
      renderFlags.splice(idx, 1)
    }
    const { resolve, done } = makeResolver()
    renderFlags.push({
      key,
      done,
      resolve,
    })

    return { resolve }
  }
  const isRenderred = function () {
    const renderFlags = funcs.renderFlags
    return Promise.all(renderFlags.map(r => r.done))
  }

  registerFunc({
    renderFlags: [],
    addRenderFlag,
    isRenderred,
  })

  return {}
}
