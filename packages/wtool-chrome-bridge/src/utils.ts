import { BridgeMessage } from './const'
import type { BaseBridge } from './base'

export const debug = function (this: BaseBridge, message: BridgeMessage, { type }: { type?: string }) {
  const bridge = this
  if (!message.extra?.trace) {
    return
  }

  const preMessage = type === 'receive' ? `${bridge.plat} 接收了` : `${bridge.plat} 发送了`
  console.log(preMessage, message)
}

export const getBridgeMap = function () {
  // 单例挂载到window上，因为当前目录也可能有多份儿
  globalThis._browserBridgeMap = globalThis._browserBridgeMap || {}
  return globalThis._browserBridgeMap
}

export const uuid = crypto?.randomUUID
  ? () => crypto.randomUUID()
  : () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
