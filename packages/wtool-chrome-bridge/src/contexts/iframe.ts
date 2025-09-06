import { WebBridge } from './web'
import { Plat, DebugDir } from '../const'
import { getBridgeMap } from '../utils'

/**
 * IFrame，使用单例
 */
export class IFrameTop extends WebBridge {
  static frameMap = new Map<string, HTMLIFrameElement | (() => HTMLIFrameElement)>()

  constructor({ plat, frameKey, frameEl }) {
    plat = plat || Plat.iframeTop
    super({ plat })
    IFrameTop.frameMap.set(frameKey, frameEl)

    const bridgeMap = getBridgeMap()
    if (bridgeMap[plat]) {
      return bridgeMap[plat]
    } else {
      bridgeMap[plat] = this
    }
  }

  async sendMessage(message) {
    const target = IFrameTop.frameMap.get(message.target)
    const frameDom = typeof target === 'function' ? target() : target
    return frameDom?.contentWindow?.postMessage(message, '*')
  }

  destroy() {
    super.destroy()
    IFrameTop.frameMap.clear()
    getBridgeMap()[this.plat] = null
  }
}

export class IFrame extends WebBridge {
  constructor({ frameKey }) {
    super({ plat: frameKey })
    const bridgeMap = getBridgeMap()
    if (bridgeMap[frameKey]) {
      return bridgeMap[frameKey]
    } else {
      bridgeMap[frameKey] = this
    }
  }

  async sendMessage(message) {
    return window.parent!.postMessage(message, '*')
  }
}

// topWin => iframeEl => iframeWin
