import { BezierPlugin } from '../../types'
import BezierFlagPoint from './BezierFlagPoint.vue'
import { FlagPointMode } from './const'

export const PluginFlagPoint = {
  components: {
    inCurve: BezierFlagPoint,
  },
  registerMode: FlagPointMode,
} as BezierPlugin
