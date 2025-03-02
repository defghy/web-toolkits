import { BaseBridge } from '../base'
import { Plat, MsgDef } from '../const'

/**
 * Web页面Bridge
 */
export class WebBridge extends BaseBridge {
  constructor() {
    super({ plat: Plat.web })
    this.init()
  }

  init() {
    window.addEventListener('message', event => {
      const message = event.data
      if (!this.isBridgeMessage(message)) return

      const { target, type, lastSendBy } = message
      // 不处理自己发出去的消息
      if (lastSendBy === this.plat) return

      // 只处理发给Web页面的消息
      if (target !== this.plat) return

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
    })
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    return window.postMessage(message, '*')
  }
}
