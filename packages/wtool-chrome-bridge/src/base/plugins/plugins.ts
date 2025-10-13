import type { RequestMessage, ResponseMessage } from '../../const'
import type { BaseBridge } from '../base'

export enum PluginEvent {
  beforeSendRequest = 'onBeforeSendRequest', // 发送request前
  onSendRequestError = 'onSendRequestError', // send方法失败
  onReceiveRequest = 'onReceiveRequest', // 接收到request
  beforeSendResponse = 'beforeSendResponse', // 发送response前
  onReceiveResponse = 'onReceiveResponse', // 收到响应
}

export interface BridgePlugin {
  bridge: BaseBridge
  [PluginEvent.beforeSendRequest]: ({ request }: { request: RequestMessage }) => any
  [PluginEvent.onSendRequestError]: ({ request, error }: { request: RequestMessage; error: Error }) => any
  [PluginEvent.onReceiveRequest]: ({ request }: { request: RequestMessage }) => any
  [PluginEvent.beforeSendResponse]: ({ response }: { response: ResponseMessage }) => any
  [PluginEvent.onReceiveResponse]: ({ response }: { response: ResponseMessage }) => any

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

  [PluginEvent.onReceiveResponse]({ response }) {
    const { pendingRequests } = this.bridge
    clearTimeout(pendingRequests.get(response.requestId)?.timeoutId)
  }
}
