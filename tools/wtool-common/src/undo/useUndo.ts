import { type Ref, computed, onBeforeUnmount, reactive, watch } from 'vue'
import { EditRecord } from './undoAPI'

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)
const ctrlText = isMac ? 'Command' : 'Ctrl'

const isUndoEvent = function (event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z'
}

const isRedoEvent = function (event: KeyboardEvent) {
  return (
    ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'z') ||
    (event.ctrlKey && event.key.toLowerCase() === 'y')
  )
}

export const useUndo = function <T extends EditRecord>({
  editRecord,
  isEnable,
  undo,
  redo,
}: {
  editRecord: T
  isEnable: Ref<boolean>
  undo?: Function
  redo?: Function
}) {
  const state = reactive({
    status: editRecord.status,
  })

  const canUndo = computed(() => state.status.canUndo)
  const canRedo = computed(() => state.status.canRedo)

  undo =
    undo ||
    function () {
      if (!canUndo.value) {
        return
      }
      editRecord.undo()
    }
  redo =
    redo ||
    function () {
      if (!canRedo.value) {
        return
      }
      editRecord.redo()
    }

  const undoStatus = computed(() => {
    const opUndoTip = `撤销 ${ctrlText}+Z`
    return {
      tip: canUndo.value && isEnable.value ? opUndoTip : '无法撤销',
      disabled: isEnable.value ? !canUndo.value : true,
    }
  })
  const redoStatus = computed(() => {
    const opRedoTip = `重做 ${ctrlText}+Shift+Z`
    return {
      tip: canRedo.value && isEnable.value ? opRedoTip : '无法重做',
      disabled: isEnable.value ? !canRedo.value : true,
    }
  })

  const onKeydown = function (event: KeyboardEvent) {
    if (!isEnable.value) {
      return
    }
    if (isUndoEvent(event)) {
      event.preventDefault()
      undo()
    }
    if (isRedoEvent(event)) {
      event.preventDefault()
      redo()
    }
  }

  const bindShortcuts = () => window.addEventListener('keydown', onKeydown)
  const unbindShortcuts = () => window.removeEventListener('keydown', onKeydown)

  watch(
    () => isEnable.value,
    function (enable) {
      if (enable) {
        bindShortcuts()
      } else {
        unbindShortcuts()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    unbindShortcuts()
  })

  return { canUndo, canRedo, undoStatus, redoStatus, undo, redo }
}
