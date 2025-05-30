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
