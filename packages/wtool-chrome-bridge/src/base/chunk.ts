import { get, set } from 'lodash-es'
import { ChunkItem, ResponseMessage } from '../const'
import { BaseBridge } from './base'
import { BridgePlugin, PluginEvent } from './plugins'
import { uuid } from '../utils'

// 普通数据分片
const data2Chunks = function ({ data, chunkSize }: { data: any; chunkSize: number }) {
  // 转换为string再分割
  let dataStr: string = data
  if (typeof data === 'object') {
    dataStr = JSON.stringify(dataStr)
  }

  const chunkCount = Math.ceil(dataStr.length / chunkSize)
  const chunks: string[] = []
  for (let i = 0; i < chunkCount; i++) {
    chunks.push(dataStr.slice(i * chunkSize, (i + 1) * chunkSize))
  }
  return chunks
}

// 接口超时功能
export class ChunkPlugin implements Partial<BridgePlugin> {
  MAX_CHUNK_SIZE = 512 * 1024 // 500k
  bridge: BaseBridge

  constructor({ bridge }: { bridge: BaseBridge }) {
    this.bridge = bridge
  }

  // 请求参数需要分块儿
  [PluginEvent.beforeSendRequest]: BridgePlugin[PluginEvent.beforeSendRequest] = async ({ request }) => {
    let chunk = request.extra?.chunk as any
    if (!chunk) {
      return
    }

    // 边界数据不需要chunk
    const { params } = request
    if (!request.params || !['string', 'object'].includes(typeof params)) {
      return
    }

    // 初始化chunk
    if (typeof chunk !== 'object') {
      chunk = {}
    }
    chunk = {
      path: '',
      size: this.MAX_CHUNK_SIZE,
      ...chunk,
    }
    request.extra!.chunk = chunk

    // params改造
    const { path: chunkPath, size: chunkSize } = chunk
    const { params: originParams } = request

    const chunkData = get(originParams, chunkPath)
    const nonChunkData = chunkPath ? set(originParams, chunkPath, null) : null

    // chunkData分块儿
    const chunks = data2Chunks({ data: chunkData, chunkSize })
    const chunkId = uuid()
    const chunkParams = chunks.map((chunkItem, index) => {
      const commonChunk = {
        chunkId,
        data: chunkItem,
        size: chunks.length,
      } as ChunkItem

      // 头部chunk保存meta信息
      if (index === 0) {
        commonChunk.nonChunkData = nonChunkData
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
  }
}
