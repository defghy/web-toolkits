import { BaseBridge } from '../base'
import { Plat, MsgDef, BridgeMessage, DebugDir, GenericFuncs } from '../const'

/**
 * extension - popup bridge
 */
export class PopupBridge<T extends GenericFuncs<T>> extends BaseBridge<T> {
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
    chrome.runtime.onMessage.addListener((message: BridgeMessage, sender) => {
      // 可能来自其他tab的信息
      if (this.tabId !== sender.tab?.id) {
        return
      }
      if (!this.isMyMessage(message)) {
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
    await this.waitTabId
    return chrome.tabs.sendMessage(this.tabId, message, {})
  }
}
