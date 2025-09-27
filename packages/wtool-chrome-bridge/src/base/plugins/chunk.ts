import { get, set } from 'lodash-es'
import { ChunkItem, ResponseMessage } from '../../const'
import { BaseBridge } from '../base'
import { BridgePlugin, PluginEvent } from './plugins'
import { uuid } from '../../utils'

interface ChunkInfo {
  chunks: any[]
  count: number
  isObject: boolean
}

// 接口超时功能
export class ChunkPlugin implements Partial<BridgePlugin> {
  MAX_CHUNK_SIZE = 512 * 1024 // 500k
  bridge: BaseBridge
  chunkMap: Record<string, Record<string, ChunkInfo>>

  constructor({ bridge }: { bridge: BaseBridge }) {
    this.bridge = bridge
    this.chunkMap = {
      req: {},
      res: {},
    }
  }

  // 请求参数需要分块儿
  [PluginEvent.beforeSendRequest]: BridgePlugin[PluginEvent.beforeSendRequest] = async ({ request }) => {
    let chunk = request.extra?.chunk as any
    if (!chunk) {
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
    const { chunks } = data2Chunks({ data: params, chunkSize })
    // 数据不足1块儿，不走chunk逻辑
    if (chunks.length <= 1) {
      return
    }

    // 每一块一个请求
    const requestList = chunks.map(chunkItem => {
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
    if (!request.extra?.chunk) {
      return
    }

    const chunkParams = request.params as ChunkItem
    if (!chunkParams?.chunkId) {
      return
    }

    // 更新chunk
    const { isFinished, data } = chunk2data({
      chunkInfoMap: this.chunkMap.req,
      requestId: request.requestId,
      chunkData: chunkParams,
    })

    // 判断传输完成了
    if (isFinished) {
      request.params = data
    } else {
      return Promise.reject('chunk still running')
    }
  };

  [PluginEvent.beforeSendResponse]: BridgePlugin[PluginEvent.beforeSendResponse] = async ({ response }) => {
    let chunk = response.extra?.chunk as any
    if (!chunk) {
      return
    }

    // 边界数据不需要chunk
    if (!response.data) {
      return
    }

    // params改造
    const { size: chunkSize } = chunk
    const { data } = response

    // chunkData分块儿
    const { chunks, isObject } = data2Chunks({ data, chunkSize })
    // 只有1块儿，不走chunk逻辑
    if (chunks.length === 1) {
      return
    }

    // 每一块一个请求
    const responseList = chunks.map(chunkItem => {
      return {
        ...response,
        data: chunkItem,
      }
    })

    // 开始发送
    for (const params of responseList) {
      await Promise.resolve()
      this.bridge.sendMessage(params)
    }

    return Promise.reject('handle by chunk plugin')
  };

  [PluginEvent.onReceiveResponse]: BridgePlugin[PluginEvent.onReceiveResponse] = async ({ response }) => {
    if (!response.extra?.chunk) {
      return
    }

    const chunkParams = response.data as ChunkItem
    if (!chunkParams?.chunkId) {
      return
    }

    // 更新chunk
    const { isFinished, data } = chunk2data({
      chunkInfoMap: this.chunkMap.res,
      requestId: response.requestId,
      chunkData: chunkParams,
    })

    // 判断传输完成了
    if (isFinished) {
      response.data = data
    } else {
      return Promise.reject('chunk still running')
    }
  }
}

// 普通数据分片
const data2Chunks = function ({ data, chunkSize }: { data: any; chunkSize: number }) {
  if (!data) {
    return { chunks: [], isObject: false }
  }
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

  const chunkMessages = chunks.map((chunkItem, index) => {
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
  return { chunks: chunkMessages }
}

// 收到chunk，整理成data
const chunk2data = function ({
  chunkInfoMap,
  requestId,
  chunkData,
}: {
  chunkInfoMap: Record<string, ChunkInfo>
  requestId: string
  chunkData: ChunkItem
}) {
  const { index, data, size, chunkId } = chunkData
  // 初始化
  if (!chunkInfoMap[requestId]) {
    chunkInfoMap[requestId] = { chunks: Array(size), count: 0 } as any
  }

  const chunkInfo = chunkInfoMap[requestId]
  // 更新chunk
  const { chunks } = chunkInfo
  chunkInfo.count++
  chunks[index] = data
  if (index === 0) {
    Object.assign(chunkInfo, { isObject: chunkData.isObject })
  }

  // 判断传输完成了
  if (chunkInfo.count === size) {
    let chunkData = chunks.join('')
    if (chunkInfo.isObject) {
      chunkData = JSON.parse(chunkData)
    }

    delete chunkInfoMap[requestId]
    return { isFinished: true, data: chunkData }
  } else {
    return { isFinished: false }
  }
}
