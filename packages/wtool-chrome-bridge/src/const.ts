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
  trace?: boolean // 追踪
  noResponse?: boolean // 无返回
  [key: string]: any
}

export interface BridgeMessage {
  type: (typeof MsgDef)[keyof typeof MsgDef]
  source: Plat
  target: Plat
  requestId: string
  path: string
  lastSendBy?: Plat
  extra?: BridgeExtra
}

export enum DebugDir {
  receive = 'receive',
  send = 'send',
}

export interface RequestMessage extends BridgeMessage {
  params?: any
}
export interface ResponseMessage extends BridgeMessage {
  data?: any
}
