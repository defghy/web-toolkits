import { WebBridge } from './web'
import { Plat, MsgDef } from '../const'

/**
 * Web页面Bridge
 */
let topSingle: IFrameTop
export class IFrameTop extends WebBridge {
  static frameMap = new Map<string, HTMLIFrameElement>()

  constructor({ frameKey, frameEl }) {
    IFrameTop.frameMap.set(frameKey, frameEl)
    if (topSingle) {
      return topSingle
    }
    super({ plat: Plat.iframeTop })
    topSingle = this
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    const frameKey = message.path.split('/')[0]
    const frameDom = IFrameTop.frameMap.get(frameKey)
    return frameDom?.contentWindow?.postMessage(message, '*')
  }
}

export class IFrame extends WebBridge {
  constructor({ frameKey }) {
    super({ plat: frameKey })
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    return window.top!.postMessage(message, '*')
  }
}

// topWin => iframeEl => iframeWin
