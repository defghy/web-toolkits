import { RequestMessage, ResponseMessage } from '../const'
import { BaseBridge } from './base'

export enum PluginEvent {
  beforeSendRequest = 'onBeforeSendRequest', // 发送请求前
  onResponse = 'onResponse', // 收到响应
  onSendRequestError = 'onSendRequestError', // send方法失败
}

export interface BridgePlugin {
  bridge: BaseBridge
  [PluginEvent.beforeSendRequest]: ({
    request, // 完整request数据
  }: {
    request: RequestMessage
  }) => any

  [PluginEvent.onSendRequestError]: ({
    request, // 完整request数据
    error,
  }: {
    request: RequestMessage
    error: Error
  }) => any

  [PluginEvent.onResponse]: ({
    response, // 完整request数据
  }: {
    response: ResponseMessage
  }) => any

  [key: string]: any
}

// 接口超时功能
class TimeoutPlugin implements Partial<BridgePlugin> {
  timeout
  bridge: BaseBridge

  constructor({ timeout = 30000, bridge }: { timeout?: number; bridge: BaseBridge }) {
    this.timeout = timeout
    this.bridge = bridge
  }

  [PluginEvent.beforeSendRequest]({ request }) {
    const { requestId, path } = request
    const { pendingRequests } = this.bridge
    const cache = pendingRequests.get(requestId)!
    // 发请求时设置超时
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId)
      cache.reject(new Error(`Request timeout for route: ${path}`))
    }, this.timeout)

    cache.timeoutId = timeoutId
  }

  [PluginEvent.onSendRequestError]({ request }) {
    const { pendingRequests } = this.bridge
    clearTimeout(pendingRequests.get(request.requestId)?.timeoutId)
  }

  [PluginEvent.onResponse]({ response }) {
    const { pendingRequests } = this.bridge
    clearTimeout(pendingRequests.get(response.requestId)?.timeoutId)
  }
}
export class BridgePlugins {
  plugins: Partial<BridgePlugin>[] = []
  bridge: BaseBridge

  constructor({ bridge }: { bridge: BaseBridge }) {
    this.plugins = [new TimeoutPlugin({ bridge })]
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
