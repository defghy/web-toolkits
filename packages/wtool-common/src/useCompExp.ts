// 整合所有功能的use，整合数据
import { Ref, ref, computed, provide, inject } from 'vue'

// exp提供统一的api，尝试用于替换ref使用方式
export const useCompExp = function <T extends Record<string, any>>({ isMaster = true, key = 'compExp' } = {} as any) {
  if (isMaster) {
    const funcs = {} as T
    const registerFunc = function (funcList: Partial<T>) {
      Object.assign(funcs, funcList)
    }
    provide(key, {
      funcs,
      registerFunc,
    })

    return { funcs, registerFunc }
  } else {
    const { funcs, registerFunc } = inject(key, { funcs: {}, registerFunc: (...args) => {} })
    return { funcs, registerFunc } as { funcs: T; registerFunc: (funcList: Partial<T>) => any }
  }
}
