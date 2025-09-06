import type { RequestMessage, ResponseMessage } from '../../const'
import type { BaseBridge } from '../base'

export enum PluginEvent {
  beforeSendRequest = 'onBeforeSendRequest', // 发送请求前
  onSendRequestError = 'onSendRequestError', // send方法失败
  onReceiveRequest = 'onReceiveRequest', // 接收到请求
  onResponse = 'onResponse', // 收到响应
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

  [PluginEvent.onReceiveRequest]: ({
    request, // 完整request数据
  }: {
    request: RequestMessage
  }) => any

  [PluginEvent.onResponse]: ({
    response, // 返回体
  }: {
    response: ResponseMessage
  }) => any

  [key: string]: any
}

// 接口超时功能
export class TimeoutPlugin implements Partial<BridgePlugin> {
  timeout
  bridge: BaseBridge

  constructor({ timeout = 30000, bridge }: { timeout?: number; bridge: BaseBridge }) {
    this.timeout = timeout
    this.bridge = bridge
  }

  [PluginEvent.beforeSendRequest]: BridgePlugin[PluginEvent.beforeSendRequest] = ({ request }) => {
    const { requestId, path, extra } = request
    const timeout = extra?.timeout || this.timeout
    const { pendingRequests } = this.bridge
    const cache = pendingRequests.get(requestId)
    if (!cache) {
      return
    }
    // 发请求时设置超时
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId)
      cache.reject(new Error(`Request timeout for route: ${path}`))
    }, timeout)

    cache.timeoutId = timeoutId
  };

  [PluginEvent.onSendRequestError]({ request }) {
    const { pendingRequests } = this.bridge
    clearTimeout(pendingRequests.get(request.requestId)?.timeoutId)
  }

  [PluginEvent.onResponse]({ response }) {
    const { pendingRequests } = this.bridge
    clearTimeout(pendingRequests.get(response.requestId)?.timeoutId)
  }
}
