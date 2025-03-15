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
}
