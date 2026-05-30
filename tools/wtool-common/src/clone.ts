// 支持delete，支持新生成对象递归遍历
export function cloneDeepWith(
  value: any,
  customizer: ({ key, val, DELETE }: { key?: string; val: any; DELETE: symbol }) => any
) {
  const DELETE = Symbol('delete')
  const cache = new Map()

  // 内部克隆函数，使用 WeakMap 追踪循环引用
  function baseClone(val: any, key?: string | number | symbol | any) {
    // 检查循环引用
    if (cache.has(val)) {
      return cache.get(val)
    }
    let result = val
    if (customizer) {
      // 调用自定义处理函数
      result = customizer({ key, val, DELETE })
    }

    // 处理原始类型
    if (!result || typeof result !== 'object' || result === DELETE) {
      cache.set(val, result)
      return result
    }

    // 获取对象类型标签
    const tag = Object.prototype.toString.call(val)

    // 根据类型进行克隆
    const handler = handlers[tag] || cloneObject
    result = handler(result)
    cache.set(val, result)

    return result
  }

  const cloneArray = (val: any[]) => {
    const result: any[] = []
    val.forEach((v, i) => {
      const cloned = baseClone(v, i)
      if (cloned !== DELETE) {
        result.push(cloned)
      }
    })
    return result
  }
  const cloneObject = (val: Object) => {
    const result = Object.create(Object.getPrototypeOf(val))

    // 处理所有自有属性（包括不可枚举和 Symbol）
    const allKeys = [...Object.keys(val), ...Object.getOwnPropertySymbols(val)]
    allKeys.forEach(key => {
      const cloned = baseClone(val[key], key)
      if (cloned !== DELETE) {
        const { get, set, ...descriptor } = Object.getOwnPropertyDescriptor(val, key) || {}
        Object.defineProperty(result, key, {
          ...descriptor,
          value: cloned,
        })
      }
    })
    return result
  }
  const cloneNoOp = (val: any) => val // 无法克隆
  const cloneErr = function (val: Error | DOMException) {
    const result = Object.create(Object.getPrototypeOf(val))
    result.name = val.name
    result.message = val.message
    result.stack = val.stack
    return result
  }
  const cloneTypeArray = (val: any) => new val.constructor(val)
  const handlers = {
    '[object Boolean]': (val: boolean) => new Boolean(val.valueOf()),
    '[object Number]': (val: number) => new Number(val.valueOf()),
    '[object String]': (val: string) => new String(val.valueOf()),
    '[object Symbol]': (val: symbol) => Object(Symbol.prototype.valueOf.call(val)),
    '[object Array]': cloneArray,
    '[object Object]': cloneObject,
    '[object Date]': (val: Date) => {
      const result = new Date(val.getTime())
      return result
    },
    '[object RegExp]': (val: RegExp) => {
      const result = new RegExp(val.source, val.flags)
      result.lastIndex = val.lastIndex
      return result
    },
    '[object Map]': (val: Map<any, any>) => {
      const result = new Map()
      val.forEach((v, k) => {
        const clonedKey = baseClone(k)
        const clonedVal = baseClone(v, clonedKey)
        if (clonedVal !== DELETE) {
          result.set(clonedKey, clonedVal)
        }
      })
      return result
    },
    '[object Set]': (val: Set<any>) => {
      const result = new Set()
      val.forEach((v, v2) => {
        const cloned = baseClone(v, v2)
        if (cloned !== DELETE) {
          result.add(cloned)
        }
      })
      return result
    },
    '[object ArrayBuffer]': (val: ArrayBuffer) => {
      return val.slice(0)
    },
    '[object DataView]': (val: DataView) => new DataView(val.buffer.slice(0), val.byteOffset, val.byteLength),
    '[object Int8Array]': cloneTypeArray,
    '[object Uint8Array]': cloneTypeArray,
    '[object Uint8ClampedArray]': cloneTypeArray,
    '[object Int16Array]': cloneTypeArray,
    '[object Uint16Array]': cloneTypeArray,
    '[object Int32Array]': cloneTypeArray,
    '[object Uint32Array]': cloneTypeArray,
    '[object Float32Array]': cloneTypeArray,
    '[object Float64Array]': cloneTypeArray,
    '[object BigInt64Array]': cloneTypeArray,
    '[object BigUint64Array]': cloneTypeArray,
    '[object Error]': cloneErr,
    '[object DOMException]': cloneErr,
    '[object Function]': cloneNoOp,
    '[object GeneratorFunction]': cloneNoOp,
    '[object AsyncFunction]': cloneNoOp,
    '[object WeakMap]': cloneNoOp,
    '[object WeakSet]': cloneNoOp,
    '[object Promise]': cloneNoOp,
  }

  return baseClone(value)
}
