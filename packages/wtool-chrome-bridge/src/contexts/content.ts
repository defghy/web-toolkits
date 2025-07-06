import { BaseBridge } from '../base'
import { Plat, MsgDef, BridgeMessage, DebugDir } from '../const'
import { getBridgeMap } from '../utils'

/**
 * Content Script Bridge
 * 负责中转消息
 */
export class ContentBridge extends BaseBridge {
  platWeb = Plat.web
  constructor({ plat, platWeb }: any = {}) {
    plat = plat || Plat.content
    const bridgeMap = getBridgeMap()
    if (bridgeMap[plat]) {
      return bridgeMap[plat]
    }
    super({ plat })
    this.platWeb = platWeb || this.platWeb
    this.init()
    bridgeMap[plat] = this
  }

  init() {
    // 监听来自Web页面的消息
    window.addEventListener('message', async event => {
      const message = event.data
      if (!this.isBridgeMessage(message)) return

      const { type, target, source, extra, lastSendBy } = message
      if (lastSendBy === this.plat) {
        return
      }

      // 多套bridge隔离
      if (source !== this.platWeb) {
        return
      }

      const isRequest = message.type === MsgDef.REQUEST
      this.debug(message, { type: DebugDir.receive })
      // 如果目标是content script，直接处理
      if (target === this.plat) {
        if (isRequest) {
          this.handleRequest({
            request: message,
            sendResponse: response => {
              this.sendMessage(response)
            },
          })
        } else {
          this.handleResponse({ response: message })
        }
        return
      }

      // 否则，转发消息
      const handle = this.sendMessage(message)

      if (isRequest && !extra?.noResponse) {
        const res = await handle
        res && this.sendMessage(res)
      }
    })

    // 监听来自background/devtools的消息
    chrome.runtime.onMessage.addListener((message: BridgeMessage, sender, sendResponse) => {
      if (!this.isBridgeMessage(message)) return

      const { type, target } = message

      this.debug(message, { type: DebugDir.receive })
      // content script自己的消息
      if (target === this.plat) {
        // 如果是发给content script的请求，处理它
        if (type === MsgDef.REQUEST) {
          this.handleRequest({ request: message, sendResponse })
          return message.extra?.noResponse ? undefined : true
        } else {
          this.handleResponse({ response: message })
        }
      }

      // 转发消息
      if (message.target === this.platWeb) {
        this.send2Web(message)
      }
    })
  }

  // 发送web时需要排除content
  send2Web(message) {
    message.lastSendBy = this.plat
    window.postMessage(message, '*')
  }

  async sendMessage(message) {
    this.debug(message, { type: DebugDir.send })
    // 发送给web页面
    if (message.target === this.platWeb) {
      return this.send2Web(message)
    }

    // 发送给其他环境（通过background转发）
    return chrome.runtime.sendMessage(message)
  }
}
