import { WebBridge } from './web'
import { Plat, DebugDir } from '../const'
import { getBridgeMap } from '../utils'

/**
 * IFrame，使用单例
 */
type FrameEl = HTMLIFrameElement | (() => HTMLIFrameElement)
export class IFrameTop<T> extends WebBridge<T> {
  static frameMap = new Map<string, FrameEl>()

  constructor({ plat, frameKey, frameEl }: { plat?: any; frameKey: string; frameEl: FrameEl }) {
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

export class IFrame<T> extends WebBridge<T> {
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
