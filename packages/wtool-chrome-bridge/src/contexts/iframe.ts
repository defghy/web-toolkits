import { WebBridge } from './web'
import { Plat, MsgDef } from '../const'

/**
 * Web页面Bridge
 */
let hostSingle: IFrameHost
export class IFrameHost extends WebBridge {
  static frameMap = new Map<string, HTMLIFrameElement>()

  constructor({ frameKey, frameEl }) {
    IFrameHost.frameMap.set(frameKey, frameEl)
    if (hostSingle) {
      return hostSingle
    }
    super({ plat: Plat.iframeTop })
    hostSingle = this
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    const frameKey = message.path.split('/')[0]
    const frameDom = IFrameHost.frameMap.get(frameKey)
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
