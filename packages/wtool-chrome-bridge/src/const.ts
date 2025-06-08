export const MsgDef = {
  REQUEST: 'wtc_request',
  RESPONSE: 'wtc_response',
  ERROR: 'wtc_error',
}

export enum Plat {
  web = 'wtc/web',
  content = 'wtc/content',
  popup = 'wtc/popup',
  devtool = 'wtc/devtool', // devtool主页面
  background = 'wtc/background',
  iframe = 'wtc/iframe',
  iframeTop = 'wtc/iframe',
  master = 'wtc/master',
  worker = 'wtc/worker',
}

export interface BridgeExtra {
  trace?: boolean
  noResponse?: boolean
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

export interface RequestMessage extends BridgeMessage {
  params?: any
}
export interface ResponseMessage extends BridgeMessage {
  data?: any
}
