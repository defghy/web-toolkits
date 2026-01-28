import { BaseBridge } from '../base'
import { Plat, MsgDef, BridgeMessage, DebugDir } from '../const'

/**
 * Web页面Bridge
 */
export class DevtoolBridge<T> extends BaseBridge<T> {
  tabId = 0

  constructor({ plat }: any = {}) {
    super({ plat: plat || Plat.devtool })
    this.tabId = chrome.devtools?.inspectedWindow.tabId
    this.init()
  }

  init() {
    chrome.runtime.onMessage.addListener((message: BridgeMessage, sender) => {
      if (!this.isMyMessage(message)) {
        return
      }
      // 可能来自其他tab的信息
      if (this.tabId !== sender.tab?.id) {
        return
      }
      this.debug(message, { type: DebugDir.receive })
      if (message.type === MsgDef.REQUEST) {
        this.handleRequest({ request: message })
      } else {
        this.handleResponse({ response: message })
      }
    })
  }

  async sendMessage(message) {
    return chrome.tabs.sendMessage(this.tabId, message, {})
  }
}
