import { Ref, watch } from 'vue'
import { debounce, cloneDeep, isEqual } from 'lodash-es'
import { UndoRecordStore, EditRecord } from '@yuhufe/web-common'
import { InnerFunc } from './useInner'

class PixelRecord extends UndoRecordStore {
  storeKey = 'pixelEditState'
  editRecord: EditRecord
  pixelData: {
    get: () => Ref<any>
    set: (newData: any) => any
  }

  constructor(editRecord: EditRecord, pixelData) {
    super()
    this.editRecord = editRecord
    this.pixelData = pixelData
  }

  get() {
    return this.pixelData.get().value
  }
  set() {
    // 修改后监听，无行为
  }
  toSnap(state) {
    return cloneDeep(state)
  }
  fromSnap: UndoRecordStore['fromSnap'] = ({ isUndo, editRecord }) => {
    const { step } = editRecord
    const patch = isUndo
      ? editRecord.getRecord({ key: this.storeKey, step: step - 1 })
      : editRecord.getRecord({ key: this.storeKey, step: step + 1 })
    this.pixelData.set(cloneDeep(patch?.snapshot))
  }
}

export class PixelEditRecord extends EditRecord {
  recordStores: UndoRecordStore[] = []
  step = 0

  constructor({ pixelData }) {
    super({ maxSize: 30 })
    this.recordStores = [new PixelRecord(this, pixelData)]
  }

  // 清空record，并增加初始数据
  init() {
    // 创建起点
    this.clear()
    this.record('init')
  }

  onBeforeDo = function () {}
  async onAfterDo(isUndo) {
    isDoing = true
    setTimeout(() => {
      isDoing = false
    }, 0)
  }
  onAfterProduce() {}

  record(key: string) {
    this.produce(key, pixelRecord => {
      pixelRecord.set(pixelRecord.get())
    })
  }
}

let isDoing = false // 区分改动来源，如果是undo/redo导致的改动，不会变更record
export const usePixelUndo = function ({ funcs }: { funcs: InnerFunc['funcs'] }) {
  const pixelData = funcs.pixelData
  const pixelHistory = new PixelEditRecord({ pixelData })
  pixelHistory.record('pixelRecord') // 记录初始状态

  const triggerRecord = debounce(() => {
    pixelHistory.record('pixelRecord')
  }, 500)
  watch(
    () => pixelData.get().value,
    function (n, o) {
      if (isDoing) {
        return
      }

      triggerRecord()
    },
    { deep: true }
  )

  return { pixelHistory }
}
