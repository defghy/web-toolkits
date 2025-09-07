import { get, set } from 'lodash-es'
import { ChunkItem, ResponseMessage } from '../../const'
import { BaseBridge } from '../base'
import { BridgePlugin, PluginEvent } from './plugins'
import { uuid } from '../../utils'

// 普通数据分片
const data2Chunks = function ({ data, chunkSize }: { data: any; chunkSize: number }) {
  // 转换为string再分割
  let dataStr: string = data
  const isObject = typeof data === 'object'
  if (isObject) {
    dataStr = JSON.stringify(dataStr)
  }

  const chunkCount = Math.ceil(dataStr.length / chunkSize)
  const chunks: string[] = []
  for (let i = 0; i < chunkCount; i++) {
    chunks.push(dataStr.slice(i * chunkSize, (i + 1) * chunkSize))
  }
  return { chunks, isObject }
}

// 接口超时功能
export class ChunkPlugin implements Partial<BridgePlugin> {
  MAX_CHUNK_SIZE = 512 * 1024 // 500k
  bridge: BaseBridge
  chunkInfoMap: Record<string, { chunks: any[]; count: number; isObject: boolean }>

  constructor({ bridge }: { bridge: BaseBridge }) {
    this.bridge = bridge
    this.chunkInfoMap = {}
  }

  // 请求参数需要分块儿
  [PluginEvent.beforeSendRequest]: BridgePlugin[PluginEvent.beforeSendRequest] = async ({ request }) => {
    let chunk = request.extra?.chunk as any
    if (!chunk) {
      return
    }

    // 边界数据不需要chunk
    if (!request.params) {
      return
    }

    // 初始化chunk
    chunk = {
      size: this.MAX_CHUNK_SIZE,
      ...chunk,
    }
    request.extra!.chunk = chunk

    // params改造
    const { size: chunkSize } = chunk
    const { params } = request

    // chunkData分块儿
    const { chunks, isObject } = data2Chunks({ data: params, chunkSize })
    // 只有1块儿，不走chunk逻辑
    if (chunks.length === 1) {
      return
    }
    const chunkParams = chunks.map((chunkItem, index) => {
      const commonChunk = {
        index,
        data: chunkItem,
        size: chunks.length,
        chunkId: uuid(),
      } as ChunkItem

      // 头部chunk保存meta信息
      if (index === 0) {
        commonChunk.isObject = isObject
      }

      return commonChunk
    })

    // 每一块一个请求
    const requestList = chunkParams.map(chunkItem => {
      return {
        ...request,
        params: chunkItem,
      }
    })

    // 开始发送
    for (const params of requestList) {
      await Promise.resolve()
      this.bridge.sendMessage(params)
    }

    return Promise.reject('handle by chunk plugin')
  };

  // 接收到请求需要合并分块儿
  [PluginEvent.onReceiveRequest]: BridgePlugin[PluginEvent.onReceiveRequest] = async ({ request }) => {
    let chunkCfg = request.extra?.chunk as any
    if (!chunkCfg) {
      return
    }

    const chunkParams = request.params as ChunkItem
    const { index, data, size, chunkId } = chunkParams
    if (!chunkId) {
      return
    }

    // 初始化
    if (!this.chunkInfoMap[request.requestId]) {
      this.chunkInfoMap[request.requestId] = { chunks: Array(size), count: 0 } as any
    }

    // 更新chunk
    const chunkInfo = this.chunkInfoMap[request.requestId]
    const { chunks } = chunkInfo
    chunkInfo.count++
    chunks[index] = data
    if (index === 0) {
      const { isObject } = chunkParams
      Object.assign(chunkInfo, { isObject })
    }

    // 判断传输完成了
    if (chunkInfo.count === size) {
      const { isObject } = chunkInfo
      let chunkData = chunks.join('')
      if (isObject) {
        chunkData = JSON.parse(chunkData)
      }

      request.params = chunkData
    } else {
      return Promise.reject('chunk still running')
    }
  }
}
