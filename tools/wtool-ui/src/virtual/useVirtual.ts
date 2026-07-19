// 整合所有功能的use，整合数据
import { Ref } from 'vue'
import { Virtualizer } from '@tanstack/vue-virtual'
import { useCompExp } from '../use'

// 对外提供的方法
export const useVirtual = function ({ isMaster = true } = {} as any) {
  const exp = useCompExp<{
    virtualer: Ref<Virtualizer<HTMLElement, Element>>
  }>({ isMaster, key: 'virtualExp' })

  return { ...exp }
}
