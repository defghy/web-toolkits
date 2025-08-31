import { ChunkPlugin } from './chunk'
import { BridgePlugin, TimeoutPlugin, PluginEvent } from './plugins'
import type { BaseBridge } from '../base'

export class BridgePlugins {
  plugins: Partial<BridgePlugin>[] = []
  bridge: BaseBridge

  constructor({ bridge }: { bridge: BaseBridge }) {
    this.plugins = [new TimeoutPlugin({ bridge }), new ChunkPlugin({ bridge })]
    this.bridge = bridge
  }

  // 执行生命周期
  async exec<T extends keyof BridgePlugin>(key: T, params: Parameters<BridgePlugin[T]>[0] = {}) {
    let stop = false
    try {
      // plugin使用reject方式来截断
      for (let plugin of this.plugins) {
        await plugin[key]?.(params)
      }
    } catch (e) {
      stop = true
    }

    return { stop }
  }
}

export { PluginEvent }
