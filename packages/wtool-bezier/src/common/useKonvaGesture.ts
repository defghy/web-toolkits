import { Ref, onBeforeUnmount, onMounted, watch } from 'vue'
import type Konva from 'konva'
import { konvaKit } from '../utils/konva'

// 交互设备类型
enum Device {
  touchpad = 'touchpad',
  mouse = 'mouse',
}
type TouchpadGesture = 'scroll' | 'pinchin' | 'pinchout'

// 鼠标按键
const PointerButton = {
  left: 1,
  right: 2,
  middle: 4,
}

// 滚轮事件封装，区分鼠标滚轮和触控板手势
export const useWheel = function ({
  targetEl,
  onWheel,
}: {
  targetEl: Ref<HTMLElement>
  onWheel: (args: { device: Device; gesture?: TouchpadGesture; event: WheelEvent }) => any
}) {
  let isTouchPad = false
  let isWheeling = false
  let wheelTimer: any = null
  const wheeling = function () {
    isWheeling = true
    clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => {
      isWheeling = false
      isTouchPad = false
    }, 350)
  }
  const wheelZoom = function (evt: WheelEvent) {
    if (!isWheeling) {
      isTouchPad = Math.max(Math.abs(evt.deltaX), Math.abs(evt.deltaY)) < 25
    }
    wheeling()

    if (!isTouchPad) {
      return onWheel({ device: Device.mouse, event: evt })
    }

    let gesture: TouchpadGesture = 'scroll'
    if (evt.ctrlKey && evt.deltaMode === 0 && evt.deltaY) {
      gesture = evt.deltaY < 0 ? 'pinchout' : 'pinchin'
    }

    onWheel({ device: Device.touchpad, gesture, event: evt })
  }

  onMounted(() => {
    targetEl.value?.addEventListener('wheel', wheelZoom)
  })
  onBeforeUnmount(() => {
    targetEl.value?.removeEventListener('wheel', wheelZoom)
  })
}

// 指针按压封装
const usePress = function ({
  targetEl,
  pressButton = PointerButton.left,
  onPressStart,
  onPressMove,
  onPressEnd,
}: {
  targetEl: Ref<HTMLElement>
  pressButton?: number
  onPressStart?: (evt: PointerEvent) => any
  onPressMove?: (evt: PointerEvent) => any
  onPressEnd?: (evt: PointerEvent) => any
}) {
  const detect = {
    isPressing: false,
    start: { x: 0, y: 0 },
  }
  let clearListener: any

  const onPointerDown = function (evt: PointerEvent) {
    Object.assign(detect, {
      isPressing: false,
      start: { x: evt.clientX, y: evt.clientY },
    })
    if (evt.buttons !== pressButton) {
      return
    }
    onPressStart?.(evt)
    targetEl.value.addEventListener('pointermove', onPointerMove)
    targetEl.value.addEventListener('pointerup', onPointerUp)
    clearListener = function () {
      targetEl.value?.removeEventListener('pointermove', onPointerMove)
      targetEl.value?.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointerup', clearListener)
      clearListener = null
    }
    document.addEventListener('pointerup', clearListener)
  }

  const onPointerMove = function (evt: PointerEvent) {
    if (!detect.isPressing) {
      if (Math.abs(evt.clientX - detect.start.x) < 5 && Math.abs(evt.clientY - detect.start.y) < 5) {
        return
      }
      detect.isPressing = true
    }

    onPressMove?.(evt)
  }

  const onPointerUp = function (evt: PointerEvent) {
    clearListener?.()
    onPressEnd?.(evt)
  }

  const offPointerDown = () => targetEl.value?.removeEventListener('pointerdown', onPointerDown)

  onMounted(() => {
    targetEl.value?.addEventListener('pointerdown', onPointerDown)
    watch(
      () => targetEl.value,
      () => {
        offPointerDown()
        targetEl.value?.addEventListener('pointerdown', onPointerDown)
      }
    )
  })
  onBeforeUnmount(() => {
    offPointerDown()
  })
}

// 容器缩放：ctrl + 滚轮（或触控板双指）
export const useScale = function ({
  wrapperRef,
  getCurrScale,
  onScaleChange,
}: {
  wrapperRef: Ref<HTMLElement>
  getCurrScale: () => number
  onScaleChange: (newScale: number) => any
}) {
  useWheel({
    targetEl: wrapperRef,
    onWheel({ device, gesture, event }) {
      if (!event.ctrlKey) {
        return
      }

      // ctrl + 滚轮触发缩放时，阻止浏览器页面缩放
      event.preventDefault()

      if (device === 'touchpad' && gesture === 'scroll') {
        return
      }
      const currScale = getCurrScale()

      let newScale = 1
      if (device === 'touchpad') {
        newScale = currScale * (event.deltaY > 0 ? 0.99 : 1.01)
      } else {
        newScale = currScale * (event.deltaY > 0 ? 0.96 : 1.04)
      }

      return onScaleChange(newScale)
    },
  })
}

// 容器平移：触控板双指滚动 / 鼠标中键拖拽
export const useTranslate = function ({
  wrapperRef,
  onTranslate,
}: {
  wrapperRef: Ref<HTMLElement>
  onTranslate: (args: { deltaX: number; deltaY: number }) => any
}) {
  useWheel({
    targetEl: wrapperRef,
    onWheel({ device, gesture, event }) {
      if (device === 'touchpad') {
        if (gesture === 'scroll') {
          const { deltaY, deltaX } = event
          onTranslate({ deltaX: -deltaX, deltaY: -deltaY })
        }
      }
    },
  })
  let lastX = 0,
    lastY = 0
  usePress({
    targetEl: wrapperRef,
    pressButton: PointerButton.middle,
    onPressStart(e) {
      e.preventDefault()
      lastX = e.clientX
      lastY = e.clientY
    },
    onPressMove(e) {
      e.preventDefault()
      const deltaX = e.clientX - lastX
      const deltaY = e.clientY - lastY
      onTranslate({ deltaX, deltaY })
      lastX = e.clientX
      lastY = e.clientY
    },
  })
}

// konva 节点缩放
export const useKonvaScale = function ({
  wrapperRef,
  onScaleChange,
  afterScaleChange,
  getTarget,
}: {
  wrapperRef: Ref<HTMLElement>
  getTarget: () => Konva.Node
  onScaleChange?: (newScale: number) => any
  afterScaleChange?: (newScale: number) => any
}) {
  onScaleChange =
    onScaleChange ||
    function (newScale) {
      const targetNode = getTarget()
      konvaKit.scaleByPointer({ newScale, node: targetNode })
      afterScaleChange?.(newScale)
    }
  useScale({
    wrapperRef,
    getCurrScale() {
      return getTarget()?.scale()?.x
    },
    onScaleChange,
  })
}

// konva 节点平移
export const useKonvaTranslate = function ({
  wrapperRef,
  getTarget,
  afterPosChange,
}: {
  wrapperRef: Ref<HTMLElement>
  getTarget: () => Konva.Node
  afterPosChange?: (newX: number, newY: number) => any
}) {
  useTranslate({
    wrapperRef,
    onTranslate({ deltaX, deltaY }) {
      const { newX, newY } = konvaKit.translateDelta({ deltaX, deltaY, target: getTarget() })
      afterPosChange?.(newX, newY)
    },
  })
}
