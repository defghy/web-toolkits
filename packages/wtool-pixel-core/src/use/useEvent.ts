import { reactive, Ref, onMounted, shallowRef, nextTick, provide, inject, toRefs, onBeforeUnmount } from 'vue'
import type Konva from 'konva'
import { merge, isEmpty, cloneDeep } from 'lodash-es'

import type { PressEvent, PixelPaletteInst } from '../types'
import type { InnerFunc } from './useInner'

const defaultWhen = {
  onGridPressed: [] as ((e: PressEvent) => any)[], // 按下格子，Press和Pressmove都算，可以通过type判断类型
  onGridHover: [] as ((e: { r: number; c: number; grid: any; layerId: any }) => any)[],
}

export type PixelWhenData = typeof defaultWhen
type PixelWhenSetData = {
  [K in keyof PixelWhenData]: PixelWhenData[K] extends (infer U)[] ? U : never
}

export type WhenCall = <T extends keyof PixelWhenData>(key: T, ...data: Parameters<PixelWhenData[T][number]>) => any

// 用于组件内部使用
export const usePixEventMaster = function ({ exp }: { exp: InnerFunc }) {
  const { registerFunc, funcs } = exp

  const call: WhenCall = function (key, ...data) {
    const pixelWhen = funcs.when
    const handlers = pixelWhen[key]
    handlers?.forEach(handler => {
      return handler(...data)
    })
  }

  registerFunc({
    when: reactive(cloneDeep(defaultWhen)),
    whenCall: call,
  })
}

// 对外暴露的事件
export const usePixEvent = function ({ comp }: { comp?: Ref<PixelPaletteInst> } = {}) {
  const unbinds = [] as Function[]
  const when = async function (cfg: Partial<PixelWhenSetData>) {
    if (!comp.value?.funcs?.when) {
      await nextTick()
    }
    const pixelWhen = comp.value?.funcs?.when
    Object.entries(cfg).forEach(([key, func]) => {
      const target = pixelWhen[key]
      if (!target.includes(func)) {
        target.push(func)
      }
    })
    // 卸载方法
    unbinds.push(() => {
      Object.entries(cfg).forEach(([key, func]) => {
        const target = pixelWhen[key]
        if (target.includes(func)) {
          pixelWhen[key] = target.filter(f => f !== func)
        }
      })
    })
  }

  onBeforeUnmount(() => {
    unbinds.forEach(func => func())
  })

  return { when }
}
