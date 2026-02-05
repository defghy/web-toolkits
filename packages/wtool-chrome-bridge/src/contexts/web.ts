import { BaseBridge } from '../base'
import { Plat, GenericFuncs } from '../const'
import { getBridgeMap } from '../utils'

/**
 * Web页面Bridge；环境单例
 */
export class WebBridge<T extends GenericFuncs<T>> extends BaseBridge<T> {
  constructor({ plat }: any = {}) {
    plat = plat || Plat.web
    super({ plat }) // super must be called

    const bridgeMap = getBridgeMap()
    if (bridgeMap[plat]) {
      return bridgeMap[plat]
    } else {
      this.init()
      bridgeMap[plat] = this
    }
  }

  init = () => {
    globalThis.addEventListener('message', this.onMessage)
  }

  onMessage = (event: MessageEvent<any>) => {
    const message = event.data

    this.onReceiveMessage(message)
  }

  destroy() {
    globalThis.removeEventListener('message', this.onMessage)
  }

  async sendMessage(message) {
    return globalThis.postMessage(message, '*')
  }
}
