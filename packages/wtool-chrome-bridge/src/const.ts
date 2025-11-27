export const MsgDef = {
  REQUEST: 'wtc_request',
  RESPONSE: 'wtc_response',
  ERROR: 'wtc_error',
}

export enum Plat {
  web = 'wtc_web',
  content = 'wtc_content',
  popup = 'wtc_popup',
  devtool = 'wtc_devtool', // devtool主页面
  background = 'wtc_background',
  iframe = 'wtc_iframe',
  iframeTop = 'wtc_iframe',
  master = 'wtc_master',
  worker = 'wtc_worker',
}

export interface BridgeExtra {
  timeout?: number // 超时时间
  trace?: boolean // 追踪
  noResponse?: boolean // 无返回
  // 参数分块儿
  chunk?:
    | {
        size: number // 块儿大小
        path: string // 数据需要分块儿
      }
    | boolean
  [key: string]: any
}

export interface BridgeMessage {
  type: (typeof MsgDef)[keyof typeof MsgDef]
  source: Plat
  target: Plat
  requestId: string
  path: string
  lastSendBy?: Plat | string
  extra?: BridgeExtra
}

export enum DebugDir {
  receive = 'receive',
  send = 'send',
}

export interface ChunkItem {
  index: number
  data: string
  size: number
  nonChunkData?: any
  [key: string]: any
}

export interface RequestMessage extends BridgeMessage {
  params?: any
}
export interface ResponseMessage extends BridgeMessage {
  data?: any
}

// polyfill chrome 119+
Promise.withResolvers =
  Promise.withResolvers ||
  function () {
    let resolve, reject
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    return { resolve, reject, promise }
  }
