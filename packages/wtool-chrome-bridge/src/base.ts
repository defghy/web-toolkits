import { Plat, MsgDef, RequestMessage, ResponseMessage, BridgeExtra } from './const'
import { debug } from './utils'

// 唯一ID生成器
const uuid = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 消息格式
class BridgeMessageFormat {
  plat: Plat
  constructor({ plat }) {
    this.plat = plat
  }

  // 请求对象
  makeRequest({ path, params, options }) {
    return {
      type: MsgDef.REQUEST,
      source: this.plat,
      target: Object.values(Plat).find(p => path.startsWith(p)) || path.split('/')[0],
      requestId: `${path}_${uuid()}`,
      params,
      path,
      extra: options,
    } as RequestMessage
  }
  // response对象
  makeResponse({ data = null, error, request }: { data?: any; error?: string; request: RequestMessage }) {
    const { requestId, path, source, params } = request
    const response = {
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
      extra: request.extra,
    } as ResponseMessage
    return response
  }
  isBridgeMessage(msgdata) {
    return msgdata?.requestId && [MsgDef.REQUEST, MsgDef.RESPONSE].includes(msgdata.type)
  }
}

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
    this.debug = this.debug.bind(this)
  }

  /**
   * 注册路由处理器
   */
  on(route: string, handler: Function) {
    this.handlers.set(route, handler)
  }

  /**
   * 注销路由处理器
   * @param {string} route - 路由路径
   */
  off(route: string) {
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

    const doResponse = ({ data, error }: any) => {
      if (request.extra?.noResponse) {
        return
      }
      const response = this.makeResponse({ data, error, request })
      sendResponse(response)
    }

    // 检查是否有对应的路由处理器
    const handler = this.handlers.get(request.path)
    if (!handler) {
      doResponse({ error: 'Route not found' })
      return false
    }

    try {
      // 执行处理器
      const params = request.params ?? {}
      const result = await handler(params)

      // 发送响应
      doResponse({ data: result })
    } catch (error: any) {
      doResponse({ error: error.message })
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

  send(path, params, options: any = {}) {
    options.noResponse = true
    const requestMessage = this.makeRequest({ path, params, options })
    this.sendMessage(requestMessage)
  }

  debug = debug

  /**
   * 发送请求并等待响应
   */
  request(path, params = {}, options: BridgeExtra = {}) {
    const requestMessage = this.makeRequest({ path, params, options })
    const { requestId } = requestMessage
    const { noResponse } = options

    return new Promise((resolve, reject) => {
      let timeoutId: any
      if (!noResponse) {
        // 设置超时
        timeoutId = setTimeout(() => {
          this.pendingRequests.delete(requestId)
          reject(new Error(`Request timeout for route: ${path}`))
        }, this.timeout)

        // 存储pending请求
        this.pendingRequests.set(requestId, {
          resolve,
          reject,
          timeoutId,
        })
      }

      // 发送请求 - 由子类实现具体发送逻辑
      this.sendMessage(requestMessage).catch(error => {
        if (!noResponse) {
          this.pendingRequests.delete(requestId)
          clearTimeout(timeoutId)
        }

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
