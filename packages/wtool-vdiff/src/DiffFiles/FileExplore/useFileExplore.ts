import type { Ref } from 'vue'
import { useCompExp } from '@yuhufe/web-ui'

// 存放单个diffEditor的数据
export const useFileExplore = function ({ isMaster = false } = {}) {
  const exp = useCompExp<{
    searchKeyword: Ref<string>
    filterTree: (keyword: string) => any
  }>({ isMaster, key: 'diffViewer' })

  return { ...exp }
}
