import { BaseBridge } from '../base'
import { Plat, MsgDef, BridgeMessage, DebugDir } from '../const'

/**
 * extension - popup bridge
 */
export class PopupBridge extends BaseBridge {
  tabId: any = 0
  waitTabId: Promise<any>

  constructor({ plat }: any = {}) {
    super({ plat: plat || Plat.popup })
    this.waitTabId = this.initActiveTabId()
    this.init()
  }

  // popupBridge only connect with current tab page
  async initActiveTabId() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    this.tabId = tabs[0]?.id
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
    await this.waitTabId
    this.debug(message, { type: DebugDir.send })
    return chrome.tabs.sendMessage(this.tabId, message, {})
  }
}
