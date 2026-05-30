export interface Snap {
  storeKey: string
  snapshot: any
  options?: any
}

export abstract class UndoRecordStore {
  storeKey = ''

  _snap = null as Snap | null

  constructor({ storeKey }: { storeKey?: string } = {}) {
    if (storeKey) {
      this.storeKey = storeKey
    }
    const originSet = this.set
    this.set = function (data: any, options: any = {}, tmpOptions: any = {}) {
      if (!this._snap) {
        this._snap = {
          storeKey: this.storeKey,
          snapshot: null,
          options,
        }
      }
      Object.assign(this._snap, {
        snapshot: this.toSnap(data, { ...options, accSnapshot: this._snap.snapshot, ...tmpOptions }),
        options: { ...this._snap.options, ...options },
      })
      originSet.call(this, data, options)
    }
  }

  get(): any {}
  set(data?: any, options?: any): void {}
  toSnap(data?: any, options?: any): any {}
  fromSnap(args: { snap: any; isUndo: boolean; isRedo: boolean; editRecord: EditRecord; options?: any }): any {}

  clearSnap() {
    this._snap = null
  }
}

class EditStatus {
  step = 0
  records: { time: number; op: string; patches: Snap[] }[] = []
  status = {
    canUndo: false,
    canRedo: false,
  }

  constructor() {
    this.updateStatus()
  }

  clear() {
    this.records = []
    this.step = -1
  }

  canUndo() {
    return !(this.step - 1 < 0)
  }

  canRedo() {
    return !(this.step + 1 > this.records.length - 1)
  }

  updateStatus() {
    Object.assign(this.status, {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    })
  }
}

export class EditRecord extends EditStatus {
  recordStores: UndoRecordStore[] = []
  step = 0
  maxSize = Number.MAX_SAFE_INTEGER

  onBeforeProduce() {}
  onAfterProduce() {}
  onBeforeDo(isUndo: boolean) {}
  onAfterDo(isUndo: boolean) {}

  constructor({ stores, maxSize }: { stores?: UndoRecordStore[]; maxSize?: number }) {
    super()
    if (stores) {
      this.recordStores = stores
    }
    if (maxSize) {
      this.maxSize = maxSize
    }
  }

  async produce(op: string, exec: (...args: UndoRecordStore[]) => void) {
    this.onBeforeProduce?.()

    await exec(...this.recordStores)

    if (this.records.length >= this.maxSize) {
      this.records.shift()
    }
    this.save(op)

    this.updateStatus()
    this.onAfterProduce?.()
  }

  save(op: string) {
    if (this.step < this.records.length - 1) {
      this.records = this.records.slice(0, this.step + 1)
    }

    const snapshots = this.recordStores
      .filter(store => !!store._snap)
      .map(store => {
        const snap = store._snap!
        store.clearSnap()
        return snap
      })
    this.records.push({
      time: Date.now(),
      op,
      patches: snapshots,
    })
    this.step = this.records.length - 1
  }

  load(step, { isUndo = false, isRedo = false } = {}) {
    const { patches } = this.records[step]
    patches.forEach(({ storeKey, snapshot, options }) => {
      const store = this.getStore(storeKey)
      store?.fromSnap({ snap: snapshot, isUndo, isRedo, editRecord: this, options })
    })
  }

  undo() {
    this.onBeforeDo?.(true)
    if (!this.canUndo()) {
      return console.warn('Cannot undo')
    }

    this.load(this.step, { isUndo: true })
    this.step--
    this.updateStatus()
    this.onAfterDo?.(true)
  }

  redo() {
    this.onBeforeDo?.(false)

    const nextStep = this.step + 1
    if (!this.canRedo()) {
      return console.warn('Cannot redo')
    }

    this.load(nextStep, { isRedo: true })
    this.step = nextStep
    this.updateStatus()
    this.onAfterDo?.(false)
  }

  getStore(key) {
    return this.recordStores.find(store => store.storeKey === key)
  }

  getRecord({ step, key }: { step: number; key: string }) {
    const record = this.records[step]
    return record.patches?.find(({ storeKey }) => key === storeKey)
  }
}
