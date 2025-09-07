import { WebBridge } from './web'
import { Plat, MsgDef } from '../const'
import { debug } from '../utils'
import { BaseBridge } from '../base'

/**
 * MasterBridge，使用单例
 */
export class MasterBridge extends BaseBridge {
  static workerMap = new Map<string, Worker>()

  constructor() {
    super({ plat: Plat.master })
  }

  bindWorker({ plat, worker }: { plat: string; worker: Worker }) {
    MasterBridge.workerMap.set(plat, worker)
    worker.addEventListener('message', this.onMessage)
  }

  onMessage = (event: MessageEvent<any>) => {
    const message = event.data
    if (!this.isMyMessage(message)) return

    const { target, type, lastSendBy } = message

    this.debug(message, { type: 'receive' })
    if (type === MsgDef.REQUEST) {
      this.handleRequest({ request: message })
    } else {
      this.handleResponse({ response: message })
    }
  }

  async sendMessage(message) {
    const worker = MasterBridge.workerMap.get(message.target)
    return worker?.postMessage(message)
  }

  destroy() {
    MasterBridge.workerMap.clear()
  }
}

export class WorkerBridge extends WebBridge {
  constructor() {
    super({ plat: Plat.worker })
  }

  async sendMessage(message) {
    return globalThis.postMessage(message)
  }
}
