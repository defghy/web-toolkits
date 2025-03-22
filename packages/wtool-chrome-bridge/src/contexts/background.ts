import { BaseBridge } from '../base'
import { Plat, MsgDef } from '../const'

/**
 * Web页面Bridge
 */
export class BackgroundBridge extends BaseBridge {
  constructor() {
    super({ plat: Plat.background })
    this.init()
  }

  init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!this.isBridgeMessage(message)) {
        return
      }
      // 只处理发给我的消息
      if (message.target !== this.plat) {
        return
      }
      if (message.type === MsgDef.REQUEST) {
        this.handleRequest({
          request: message,
          sendResponse,
        })
        return true
      } else {
        this.handleResponse({ response: message })
      }
    })
  }

  async sendMessage(message) {
    // background通信web需要指定tabId，这里的通信指的是popup和option页面
    return chrome.runtime.sendMessage(message, {})
  }
}
