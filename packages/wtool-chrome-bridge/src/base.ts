import { Plat, MsgDef } from './const'

// 唯一ID生成器
const uuid = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 消息格式
class BridgeMessageFormat {
  plat: Plat
  constructor({ plat }) {
    this.plat = plat
  }

  // 请求对象
  makeRequest({ path, params }) {
    return {
      type: MsgDef.REQUEST,
      source: this.plat,
      target: Object.values(Plat).find(p => path.startsWith(p)) || path.split('/')[0],
      requestId: `${path}_${uuid()}`,
      params,
      path,
      needResponse: true,
    }
  }
  // response对象
  makeResponse({ data = null, error, request }: { data?: any; error?: string; request: RequestMessage }) {
    const { requestId, path, source } = request
    return {
      type: MsgDef.RESPONSE,
      path,
      source: this.plat,
      target: source,
      requestId,
      data: {
        ret: error ? -1 : 0,
        errmsg: error || undefined,
        data,
      },
    }
  }
  isBridgeMessage(msgdata) {
    return msgdata?.requestId && [MsgDef.REQUEST, MsgDef.RESPONSE].includes(msgdata.type)
  }
}

type ExtraMessage = { lastSendBy?: Plat }
type RequestMessage = ReturnType<BridgeMessageFormat['makeRequest']> & ExtraMessage
type ResponseMessage = ReturnType<BridgeMessageFormat['makeResponse']> & ExtraMessage

/**
 * 基础Bridge类
 */
export class BaseBridge extends BridgeMessageFormat {
  plat: Plat
  handlers: Map<string, Function> = new Map()
  pendingRequests: Map<string, any> = new Map()
  timeout = 30000
  constructor({ plat }) {
    super({ plat })
    this.plat = plat
  }

  /**
   * 注册路由处理器
   * @param {string} route - 路由路径
   * @param {Function} handler - 处理函数
   */
  on(route, handler) {
    this.handlers.set(route, handler)
  }

  /**
   * 注销路由处理器
   * @param {string} route - 路由路径
   */
  off(route) {
    this.handlers.delete(route)
  }

  // 处理接收到的请求
  async handleRequest({
    request,
    sendResponse,
  }: {
    request: RequestMessage
    sendResponse: (res: ResponseMessage) => any
  }) {
    if (request.type !== MsgDef.REQUEST) return false

    if (request.source === this.plat) {
      return console.error('not support invoke own api')
    }

    // 检查是否有对应的路由处理器
    const handler = this.handlers.get(request.path)
    if (!handler) {
      const err = this.makeResponse({ error: 'Route not found', request })
      sendResponse(err)
      return false
    }

    try {
      // 执行处理器
      const result = await handler(request.params || {})

      // 发送响应
      const response = this.makeResponse({ data: result, request })
      sendResponse(response)
    } catch (error: any) {
      const err = this.makeResponse({ error: error.message, request })
      sendResponse(err)
    }

    // 返回true表示会异步发送响应
    return true
  }

  /**
   * 处理接收到的响应
   */
  handleResponse({ response }: { response: ResponseMessage }) {
    if (response.type !== MsgDef.RESPONSE) return

    const { requestId, data } = response
    const pendingRequest = this.pendingRequests.get(requestId)
    if (!pendingRequest) return

    this.pendingRequests.delete(requestId)
    clearTimeout(pendingRequest.timeoutId)

    if (data.ret !== 0) {
      pendingRequest.reject(data)
    } else {
      pendingRequest.resolve(data.data)
    }
  }

  send(path, params) {
    const requestMessage = this.makeRequest({ path, params })
    requestMessage.needResponse = false
    this.sendMessage(requestMessage)
  }

  /**
   * 发送请求并等待响应
   */
  request(path, params = {}) {
    const requestMessage = this.makeRequest({ path, params })
    const { requestId } = requestMessage

    return new Promise((resolve, reject) => {
      // 设置超时
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId)
        reject(new Error(`Request timeout for route: ${path}`))
      }, this.timeout)

      // 存储pending请求
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeoutId,
      })

      // 发送请求 - 由子类实现具体发送逻辑
      this.sendMessage(requestMessage).catch(error => {
        this.pendingRequests.delete(requestId)
        clearTimeout(timeoutId)
        reject(error)
      })
    })
  }

  /**
   * 发送消息 - 由子类实现
   * @param {Object} message - 消息对象
   */
  async sendMessage(message) {
    throw new Error('sendMessage method must be implemented by subclass')
  }
}
