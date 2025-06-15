import { BaseBridge } from '../base'
import { Plat, MsgDef, RequestMessage } from '../const'

/**
 * Web页面Bridge
 */
export class BackgroundBridge extends BaseBridge {
  constructor({ plat }: any = {}) {
    super({ plat: plat || Plat.background })
    this.init()
  }

  init() {
    chrome.runtime.onMessage.addListener((message: RequestMessage, sender, sendResponse) => {
      if (!this.isBridgeMessage(message)) {
        return
      }
      // 只处理发给我的消息
      if (message.target !== this.plat) {
        return
      }
      if (message.type === MsgDef.REQUEST) {
        // 插入一些环境参数
        let params = message.params
        if (typeof params === 'object' && params) {
          message.params.sender = sender
        } else {
          params = { data: params, sender }
        }
        message.params = params
        this.handleRequest({
          request: message,
          sendResponse,
        })
        return message.extra?.noResponse ? undefined : true
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
