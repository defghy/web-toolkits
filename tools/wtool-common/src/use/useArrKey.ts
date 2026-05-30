import type { Ref } from 'vue'

export const useArrKey = function ({ arr }: { arr: Ref<any[]> }) {
  const idMap = new WeakMap()
  const getId = function (listItem: any) {
    let key = idMap.get(listItem)
    if (key) {
      return key
    }

    key = crypto.randomUUID()
    idMap.set(listItem, key)
    return key
  }

  const id2Idx = function (id: string) {
    return arr.value.findIndex(item => getId(item) === id)
  }
  const idx2Id = function (idx: number) {
    return arr.value[idx] ? getId(arr.value[idx]) : ''
  }

  return { id2Idx, idx2Id, getId }
}
