import type { Ref } from 'vue'
import { useCompExp } from '@yuhufe/web-ui'

// 存放单个diffEditor的数据
export const useDiffViewer = function ({ isMaster = false } = {}) {
  const exp = useCompExp<{
    viewed: Ref<boolean>
    rawed: Ref<boolean>
    updateViewed: (viewed: boolean) => any // 控制是否viewed
    updateRawed: (args: boolean) => any // 控制是否收起展开
    updateChangedLines: (args: { added: number; removed: number }) => any
    canUnchangeVisible: Ref<boolean> // 未改动区域是否可见
  }>({ isMaster, key: 'diffViewer' })

  return { ...exp }
}
