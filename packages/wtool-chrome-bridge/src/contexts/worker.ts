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
    if (!this.isBridgeMessage(message)) return

    const { target, type, lastSendBy } = message
    // 不处理自己发出去的消息
    if (lastSendBy === this.plat) return

    // 只处理发给Web页面的消息
    if (target !== this.plat) return

    this.debug(message, { type: 'receive' })
    if (type === MsgDef.REQUEST) {
      this.handleRequest({
        request: message,
        sendResponse: response => {
          this.sendMessage(response)
        },
      })
    } else {
      this.handleResponse({ response: message })
    }
  }

  async sendMessage(message) {
    this.debug(message, { type: 'send' })
    message.lastSendBy = this.plat
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
    this.debug(message, { type: 'send' })
    message.lastSendBy = this.plat
    return globalThis.postMessage(message)
  }
}
