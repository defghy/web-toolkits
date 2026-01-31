import { BaseBridge } from '../base'
import { Plat, MsgDef, BridgeMessage, DebugDir, GenericFuncs } from '../const'
import { getBridgeMap } from '../utils'

/**
 * Content Script Bridge
 * 负责中转消息
 */
export class ContentBridge<T extends GenericFuncs> extends BaseBridge<T> {
  platWeb = Plat.web

  constructor({ plat, platWeb }: any = {}) {
    plat = plat || Plat.content
    super({ plat })

    const bridgeMap = getBridgeMap()
    if (bridgeMap[plat]) {
      return bridgeMap[plat]
    } else {
      this.platWeb = platWeb || this.platWeb
      this.init()
      bridgeMap[plat] = this
    }
  }

  init() {
    // 监听来自Web页面的消息
    window.addEventListener('message', async event => {
      const message = event.data
      if (!this.isBridgeMessage(message)) return

      const { type, target, source, extra, lastSendBy } = message as BridgeMessage
      if (lastSendBy === this.plat) {
        return
      }

      const isRequest = message.type === MsgDef.REQUEST
      // 如果目标是content script，直接处理
      if (this.isMyMessage(message)) {
        this.debug(message, { type: DebugDir.receive })
        if (isRequest) {
          this.handleRequest({ request: message })
        } else {
          this.handleResponse({ response: message })
        }
        return
      }

      // 转发消息
      if (source === this.platWeb) {
        this.debug(message, { type: DebugDir.receive })
        this.sendMessage(message)
      }
    })

    // 监听来自background/devtools的消息
    chrome.runtime.onMessage.addListener((message: BridgeMessage, sender, sendResponse) => {
      if (!this.isBridgeMessage(message)) return

      const { type, target } = message

      // content script自己的消息
      if (this.isMyMessage(message)) {
        this.debug(message, { type: DebugDir.receive })
        // 如果是发给content script的请求，处理它
        if (type === MsgDef.REQUEST) {
          this.handleRequest({ request: message })
        } else {
          this.handleResponse({ response: message })
        }
        return
      }

      // 转发消息
      if (message.target === this.platWeb) {
        this.debug(message, { type: DebugDir.receive })
        this.sendMessage(message)
      }
    })
  }

  async sendMessage(message) {
    // 发送给web页面
    if (message.target === this.platWeb) {
      return window.postMessage(message, '*')
    }

    // 发送给其他环境（通过background转发）
    return chrome.runtime.sendMessage(message)
  }
}
