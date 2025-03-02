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

      // 只处理发给Web页面的消息
      if (message.target !== this.plat) return

      if (message.type === MsgDef.REQUEST) {
        this.handleRequest({
          request: message,
          sendResponse: response => {
            window.postMessage(response, '*')
          },
        })
      } else {
        this.handleResponse({ response: message })
      }
    })
  }

  async sendMessage(message) {
    return window.postMessage(message, '*')
  }
}
