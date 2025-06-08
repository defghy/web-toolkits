import { BaseBridge } from '../base'
import { Plat, MsgDef } from '../const'

/**
 * Web页面Bridge；环境单例
 */
export class WebBridge extends BaseBridge {
  constructor({ plat }: any = {}) {
    // 单例挂载到window上，因为当前目录也可能有多份儿
    globalThis._browserBridgeMap = globalThis._browserBridgeMap || {}
    plat = plat || Plat.web
    const bridgeMap = globalThis._browserBridgeMap
    if (bridgeMap[plat]) {
      return bridgeMap[plat]
    }
    super({ plat })
    this.init()
    bridgeMap[plat] = this
  }

  init = () => {
    globalThis.addEventListener('message', this.onMessage)
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

  destroy() {
    globalThis.removeEventListener('message', this.onMessage)
  }

  async sendMessage(message) {
    this.debug(message, { type: 'send' })
    message.lastSendBy = this.plat
    return globalThis.postMessage(message, '*')
  }
}
