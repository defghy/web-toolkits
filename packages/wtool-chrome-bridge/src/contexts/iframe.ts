import { WebBridge } from './web'
import { Plat, MsgDef } from '../const'

/**
 * IFrame，使用单例
 */
export class IFrameTop extends WebBridge {
  static frameMap = new Map<string, HTMLIFrameElement | (() => HTMLIFrameElement)>()
  static singleton: IFrameTop | null

  constructor({ plat, frameKey, frameEl }) {
    plat = plat || Plat.iframeTop
    super({ plat })
    IFrameTop.frameMap.set(frameKey, frameEl)
    if (IFrameTop.singleton) {
      return IFrameTop.singleton
    } else {
      IFrameTop.singleton = this
    }
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    const frameKey = message.path.split('/')[0]
    const target = IFrameTop.frameMap.get(frameKey)
    const frameDom = typeof target === 'function' ? target() : target
    return frameDom?.contentWindow?.postMessage(message, '*')
  }

  destroy() {
    super.destroy()
    IFrameTop.frameMap.clear()
    IFrameTop.singleton = null
  }
}

export class IFrame extends WebBridge {
  static singleton: IFrame
  constructor({ frameKey }) {
    super({ plat: frameKey })
    if (IFrame.singleton) {
      return IFrame.singleton
    } else {
      IFrame.singleton = this
    }
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    return window.top!.postMessage(message, '*')
  }
}

// topWin => iframeEl => iframeWin
