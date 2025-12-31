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
    chrome.runtime.onMessage.addListener((message: RequestMessage, sender) => {
      if (!this.isMyMessage(message)) {
        return
      }

      // 插入一些环境参数
      message.tabId = message.tabId || sender?.tab?.id
      if (message.type === MsgDef.REQUEST) {
        this.handleRequest({ request: message })
      } else {
        this.handleResponse({ response: message })
      }
    })
  }

  async sendMessage(message) {
    if (message?.tabId) {
      chrome.tabs.sendMessage(message.tabId, message)
    } else {
      // background通信web需要指定tabId，这里的通信指的是popup和option页面
      return chrome.runtime.sendMessage(message, {})
    }
  }
}
