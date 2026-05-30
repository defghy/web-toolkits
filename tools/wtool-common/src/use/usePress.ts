import { type Ref, onBeforeUnmount, onMounted, watch } from 'vue'

const PointerButton = {
  left: { key: 'left', buttons: 1 },
  right: { key: 'right', buttons: 2 },
  middle: { key: 'middle', buttons: 4 },
} as const

type PointerButtonKey = keyof typeof PointerButton

const extractPointerEvt = function (evt: PointerEvent | Object) {
  if (evt.constructor.name === 'PointerEvent') {
    return evt as PointerEvent
  }

  return (evt as any).evt as PointerEvent
}

export const usePress = function ({
  targetEl,
  targetKonvaEl,
  pressButton = PointerButton.left.key,
  onPressStart,
  onPressMove,
  onPressEnd,
}: {
  targetEl?: Ref<HTMLElement>
  targetKonvaEl?: () => Promise<any>
  pressButton?: PointerButtonKey
  onPressStart?: (evt: PointerEvent | any) => any
  onPressMove?: (evt: PointerEvent | any) => any
  onPressEnd?: (evt: PointerEvent | any) => any
}) {
  let eventBus: { on: Function; off: Function }
  async function initBus() {
    if (eventBus) {
      return
    }
    if (targetEl?.value.addEventListener) {
      eventBus = {
        on: (...args) => (targetEl.value?.addEventListener as any)?.(...args),
        off: (...args) => (targetEl.value?.removeEventListener as any)?.(...args),
      }
      return
    }

    const konvaEl: any = await targetKonvaEl?.()
    if (konvaEl?.on) {
      eventBus = {
        on: konvaEl.on.bind(konvaEl),
        off: konvaEl.off.bind(konvaEl),
      }
    }
  }

  let clearListener: any
  const pressButtonVal = PointerButton[pressButton].buttons
  const detect = {
    isPressing: false,
    start: { x: 0, y: 0 },
  }
  const onPointerDown = function (evt) {
    const e = extractPointerEvt(evt)
    Object.assign(detect, {
      isPressing: false,
      start: { x: e.clientX, y: e.clientY },
    })
    if (e.buttons !== pressButtonVal) {
      return
    }
    onPressStart?.(evt)
    eventBus.on('pointermove', onPointerMove)
    eventBus.on('pointerup', onPointerUp)
    clearListener = function () {
      eventBus.off('pointermove', onPointerMove)
      eventBus.off('pointerup', onPointerUp)
      document.removeEventListener('pointerup', clearListener)
      clearListener = null
    }
    document.addEventListener('pointerup', clearListener)
  }

  const onPointerMove = function (evt) {
    const e = extractPointerEvt(evt)
    if (!detect.isPressing) {
      if (Math.abs(e.clientX - detect.start.x) < 5 && Math.abs(e.clientY - detect.start.y) < 5) {
        return
      }
      detect.isPressing = true
    }

    onPressMove?.(evt)
  }

  const onPointerUp = function (evt) {
    clearListener?.()
    onPressEnd?.(evt)
  }

  onMounted(async () => {
    await initBus()
    eventBus.on('pointerdown', onPointerDown)
    startWatch()
  })
  onBeforeUnmount(() => {
    eventBus?.off('pointerdown', onPointerDown)
  })

  function startWatch() {
    if (targetEl) {
      watch(
        () => targetEl.value,
        async function () {
          await initBus()
          eventBus.off('pointerdown', onPointerDown)
          eventBus.on('pointerdown', onPointerDown)
        }
      )
    }
  }

  return {}
}
