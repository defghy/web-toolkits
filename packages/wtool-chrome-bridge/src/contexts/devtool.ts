import { BaseBridge } from '../base'
import { Plat, MsgDef, BridgeMessage, DebugDir } from '../const'

/**
 * Web页面Bridge
 */
export class DevtoolBridge extends BaseBridge {
  tabId = 0

  constructor({ plat }: any = {}) {
    super({ plat: plat || Plat.devtool })
    this.tabId = chrome.devtools?.inspectedWindow.tabId
    this.init()
  }

  init() {
    chrome.runtime.onMessage.addListener((message: BridgeMessage, sender, sendResponse) => {
      if (!this.isBridgeMessage(message)) {
        return
      }
      // 可能来自其他tab的信息
      if (this.tabId !== sender.tab?.id) {
        return
      }
      // 只处理发给我的消息
      if (message.target !== this.plat) {
        return
      }
      this.debug(message, { type: DebugDir.receive })
      if (message.type === MsgDef.REQUEST) {
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
    this.debug(message, { type: DebugDir.send })
    return chrome.tabs.sendMessage(this.tabId, message, {})
  }
}
