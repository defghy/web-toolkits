import { WebBridge } from './web'
import { Plat, MsgDef } from '../const'

/**
 * IFrame，使用单例
 */
export class IFrameTop extends WebBridge {
  static frameMap = new Map<string, HTMLIFrameElement | (() => HTMLIFrameElement)>()
  static singleton: IFrameTop | null

  constructor({ frameKey, frameEl }) {
    IFrameTop.frameMap.set(frameKey, frameEl)
    if (IFrameTop.singleton) {
      return IFrameTop.singleton
    }
    super({ plat: Plat.iframeTop })
    IFrameTop.singleton = this
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
    if (IFrame.singleton) {
      return IFrame.singleton
    }
    super({ plat: frameKey })
  }

  async sendMessage(message) {
    message.lastSendBy = this.plat
    return window.top!.postMessage(message, '*')
  }
}

// topWin => iframeEl => iframeWin
