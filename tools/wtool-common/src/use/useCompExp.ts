import { provide, inject } from 'vue'

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
