import { BaseBridge } from '../base'
import { Plat, MsgDef } from '../const'

/**
 * Content Script Bridge
 * 负责中转消息
 */
export class ContentBridge extends BaseBridge {
  constructor() {
    super({ plat: Plat.content })
    this.init()
  }

  init() {
    // 监听来自Web页面的消息
    window.addEventListener('message', async event => {
      const message = event.data
      if (!this.isBridgeMessage(message)) return

      const { type, target, needResponse, byContent } = message
      if (byContent) {
        return
      }
      // 如果目标是content script，直接处理
      if (target === this.plat) {
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
        return
      }

      // 否则，转发消息
      const handle = chrome.runtime.sendMessage(message)

      if (needResponse) {
        const res = await handle
        window.postMessage(res, '*')
      }
    })

    // 监听来自background/devtools的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!this.isBridgeMessage(message)) return

      const { type, target, needResponse } = message

      // content script自己的消息
      if (target === this.plat) {
        // 如果是发给content script的请求，处理它
        if (type === MsgDef.REQUEST) {
          return this.handleRequest({ request: message, sendResponse })
        } else {
          this.handleResponse({ response: message })
          return false
        }
      }

      // 转发消息
      if (message.target === Plat.web) {
        this.send2Web(message)
        return false
      }

      return false
    })
  }

  send2Web(message) {
    if (message.target !== Plat.web) {
      return
    }
    message.byContent = true
    window.postMessage(message, '*')
  }

  async sendMessage(message) {
    // 发送给web页面
    if (message.target === Plat.web) {
      return this.send2Web(message)
    }

    // 发送给其他环境（通过background转发）
    return chrome.runtime.sendMessage(message)
  }
}
