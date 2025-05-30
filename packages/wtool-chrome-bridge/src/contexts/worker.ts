import { WebBridge } from './web'
import { Plat, MsgDef } from '../const'

/**
 * IFrame，使用单例
 */
export class MasterBridge extends WebBridge {
  constructor() {
    super({ plat: Plat.master })
  }
}

export class WorkerBridge extends WebBridge {
  constructor() {
    super({ plat: Plat.worker })
  }
}
