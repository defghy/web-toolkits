import { useCompExp } from '@yuhufe/web-ui'

// 存放单个diffEditor的数据
export const useDiffViewer = function ({ isMaster = false }) {
  const exp = useCompExp<{
    changeViewed
    changeCollaspe
  }>({ isMaster, key: 'diffViewer' })

  return { ...exp }
}
