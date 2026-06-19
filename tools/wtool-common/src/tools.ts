export const nextTick = async function () {
  return new Promise<void>(r => {
    const waitFunc = globalThis.queueMicrotask || globalThis.requestAnimationFrame
    waitFunc?.(r)
  })
}

export function waitTime(time = 100) {
  return new Promise(r => setTimeout(r, time))
}
export function waitAnimate() {
  return new Promise(r => window.requestAnimationFrame(r))
}
export function waitMicrotask() {
  return new Promise<void>(r => globalThis.queueMicrotask(r))
}
export function waitUntil(trigger) {
  let tryCount = 0
  return new Promise(async (resolve, reject) => {
    while (tryCount < 100) {
      if (trigger()) {
        return resolve(tryCount)
      }
      tryCount++
      await waitTime(0)
    }

    reject('waitUntil 执行失败，超过上线次数')
  })
}
export function singlePromiser(func: (...args: any[]) => Promise<any>) {
  let promise: any = null
  return function (...args) {
    if (!promise) {
      promise = func(...args)
    }
    return promise
  }
}
export function makeDefer() {
  let res: any
  const defer = new Promise(resolve => {
    res = resolve
  })

  return {
    defer,
    resolve(data?: any) {
      return res?.(data)
    },
  }
}
export type Defer = ReturnType<typeof makeDefer>

// 提供dynamic import组件加载完成loaded
export const dynamicImportWrapper = function (importExp) {
  let resolve: Function
  // 文件请求完成q
  const loaded = new Promise(res => {
    resolve = async function (r) {
      await nextTick() // 文件加载后，nextTick组件初始化完成
      res(r)
    }
  })
  const wrapperFunc = async () => {
    const res = await importExp()
    resolve(res)
    return res
  }
  wrapperFunc.loaded = loaded
  return wrapperFunc
}

// 字符串对比
export const strUtil = {
  like(mainStr?: string | null, searchStr?: string | null) {
    if (!searchStr) {
      return true
    }
    if (!mainStr) {
      return false
    }
    return String(mainStr).trim().toLowerCase().includes(String(searchStr).trim().toLowerCase())
  },
}

type ArrPreviousParams<T> = {
  list: T[]
  callback: (item: T, index: number) => any
  startIndex?: any
}
export const arrUtil = {
  remove(list: any[], callback) {
    const index = list.findIndex(callback)
    if (index >= 0) {
      list.splice(index, 1)
    }
  },
  findPreviousIndex<T>({ list, callback, startIndex }: ArrPreviousParams<T>) {
    if (startIndex === undefined) {
      startIndex = -1
    }
    return list.findIndex((item, index) => {
      if (index <= startIndex) {
        return false
      }
      return callback(item, index)
    })
  },
  findPrevious<T>(args: ArrPreviousParams<T>) {
    const { list } = args
    const targetIndex = arrUtil.findPreviousIndex(args)
    return targetIndex >= 0 ? list[targetIndex] : null
  },
  // 数组分段
  segment<T>(
    arr: T[],
    {
      groupKey,
      isSameSegment,
    }: {
      groupKey?: (item: T) => any
      isSameSegment?: (pre: T, cur: T) => boolean
    } = {}
  ) {
    const defaultGroupKey = () => ''
    groupKey = groupKey || defaultGroupKey

    // 经常是数字分组，一般都是连续性分组
    if (typeof arr[0] === 'number') {
      if (!isSameSegment) {
        isSameSegment = ((v1: number, v2: number) => Math.abs(v1 - v2) === 1) as any
      }
    }

    // 先分组
    type GroupData = { groupKey: string; list: T[] }
    const groupMap = {} as Record<string, GroupData>
    arr.forEach(item => {
      const gpKey = groupKey(item)
      if (!groupMap[gpKey]) {
        groupMap[gpKey] = { groupKey: gpKey, list: [] }
      }
      groupMap[gpKey].list.push(item)
    })

    // 再分段
    const segments = [] as T[][]
    Object.values(groupMap).forEach(({ groupKey, list }) => {
      let currSegment = [] as T[]
      segments.push(currSegment)
      list.forEach(item => {
        const pre = currSegment.at(-1)
        if (!pre) {
          return currSegment.push(item)
        }
        if (isSameSegment?.(pre, item)) {
          return currSegment.push(item)
        }

        // 新的分段
        currSegment = [item]
        segments.push(currSegment)
      })
    })

    return segments.filter(segment => !!segment.length)
  },
  // { min: 1, max: 3 } => [1,2,3]
  range2Arr({ min, max }: { min: number; max: number }) {
    min = +min
    max = +max
    return Array.from({ length: max - min + 1 }, (_, index) => index + min)
  },
  // 对象数组
  toObjMap: function <T, V extends keyof T>(arr: T[], keyName: string, valName?: V) {
    return arr.reduce((acc, cur: any) => {
      acc[cur[keyName]] = valName ? cur[valName] : cur
      return acc
    }, {})
  } as {
    <T = any, K extends keyof T = keyof T>(arr: T[], keyName: K): Record<T[K] & (string | number | symbol), T>
    <T = any, K extends keyof T = keyof T, V extends keyof T = keyof T>(arr: T[], keyName: K, valName: V): Record<
      T[K] & (string | number | symbol),
      T[V]
    >
  },
  // 原始类型数组
  toMap<T extends string | number>(arr: T[]) {
    return arr.reduce((acc, cur) => {
      acc[cur as any] = true
      return acc
    }, {} as Record<T, boolean>)
  },
  toMMap<T>(arr: T[], keyName: string) {
    const m = new Map<any, T>()
    arr.forEach(item => {
      m.set(item[keyName], item)
    })
    return m
  },
  // 去重
  uniq(list: any[], keyName?: string) {
    if (!keyName) {
      return Array.from(new Set(list))
    }

    const existed: any = {}
    return list.filter(item => {
      const key = item[keyName]
      if (existed[key]) {
        return false
      }

      existed[key] = true
      return true
    })
  },
} as const

export const objUtil = {
  // 对象有对应的值就直接用，否则初始化1个
  ensure(dict: any, keys: (string | number)[], initVal: any = [], forceUpdate = false) {
    let obj = dict
    const innerEnsure = (obj: any, key: any, v: any) => {
      if (!obj[key] || forceUpdate) {
        obj[key] = v
      }
    }
    while (keys.length > 1) {
      const key = keys.shift()
      // 多级对象
      innerEnsure(obj, key, {})
      obj = obj[key as any]
    }
    const key = keys[0]
    innerEnsure(obj, key, initVal)
    return obj[key]
  },
  // 初始化 + 覆盖
  ensureSet(...args: Parameters<(typeof objUtil)['ensure']>) {
    const [dict, keys, initVal] = args
    return objUtil.ensure(dict, keys, initVal, true)
  },
  // 剪枝一个对象，只有所有子元素都为false，才过滤掉当前节点
  prune(obj: any[] | Record<string, any>, callback: (args: { key: string | number; value: any }) => boolean) {
    const DELETE = Symbol('delete')

    const run = function (key, val: any) {
      const isCurrValid = callback({ key, value: val })
      if (isCurrValid) {
        return val
      }
      // 普通值直接进行判断
      if (!val || typeof val !== 'object') {
        return DELETE
      }

      if (Array.isArray(val)) {
        const newArr = val.map((v, i) => run(i, v)).filter(v => v !== DELETE)
        if (newArr.length) {
          return newArr
        }
        return DELETE
      }

      // 对象
      const newObj = Object.fromEntries(
        Object.entries(val)
          .map(([k, v]) => [k, run(k, v)])
          .filter(([k, v]) => v !== DELETE)
      )
      if (Object.keys(newObj).length) {
        return newObj
      }
      return DELETE
    }

    const result = run('', obj)

    return result === DELETE ? null : result
  },
  pruneByWord(obj: any[] | Record<string, any>, keyword) {
    return objUtil.prune(obj, function ({ key, value }) {
      if (strUtil.like(`${key}`, keyword)) {
        return true
      }
      if (typeof value !== 'object') {
        if (strUtil.like(`${value}`, keyword)) {
          return true
        }
      }

      return false
    })
  },
  jsonParse(str: string) {
    let res = {}
    try {
      res = JSON.parse(str)
    } catch {}
    return res
  },
} as const

export const v4 = (globalThis as any).crypto.randomUUID
  ? () => crypto.randomUUID()
  : () => {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }

// 读取一个字典中对应值，没有就新建一个
export const ensureMap = function (dict: any, key: string, initVal: any = []) {
  if (!dict[key]) {
    dict[key] = initVal
  }
  return dict[key]
}
