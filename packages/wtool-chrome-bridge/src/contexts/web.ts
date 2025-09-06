import { BaseBridge } from '../base'
import { Plat, MsgDef } from '../const'
import { getBridgeMap } from '../utils'

/**
 * Web页面Bridge；环境单例
 */
export class WebBridge extends BaseBridge {
  constructor({ plat }: any = {}) {
    plat = plat || Plat.web
    super({ plat }) // super must be called

    const bridgeMap = getBridgeMap()
    if (bridgeMap[plat]) {
      return bridgeMap[plat]
    } else {
      this.init()
      bridgeMap[plat] = this
    }
  }

  init = () => {
    globalThis.addEventListener('message', this.onMessage)
  }

  onMessage = (event: MessageEvent<any>) => {
    const message = event.data
    if (!this.isMyMessage(message)) return

    const { target, type, lastSendBy } = message

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

  destroy() {
    globalThis.removeEventListener('message', this.onMessage)
  }

  async sendMessage(message) {
    return globalThis.postMessage(message, '*')
  }
}
