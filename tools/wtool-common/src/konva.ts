import type Konva from 'konva'

const compNames = [
  'KStage',
  'KLayer',
  'KFastLayer',
  'KGroup',
  'KLabel',
  'KRect',
  'KCircle',
  'KEllipse',
  'KWedge',
  'KLine',
  'KSprite',
  'KImage',
  'KText',
  'KTextPath',
  'KStar',
  'KRing',
  'KArc',
  'KTag',
  'KPath',
  'KRegularPolygon',
  'KArrow',
  'KShape',
  'KTransformer',
] as const

const components = {} as Record<(typeof compNames)[number], any>

export const loadKonva = function (VueKonva: any) {
  VueKonva.install(
    {
      component(key: (typeof compNames)[number], component: any) {
        components[key] = component
      },
    },
    { prefix: 'K' }
  )
}

export const KonvaComps = components

const findParent = function (el: Konva.Node | null, callback: (el: Konva.Node) => boolean) {
  while (el) {
    if (callback(el)) {
      return el
    }
    el = el.parent
  }

  return el
}

const scaleByPoint = function ({ x, y, newScale, node }: { x: number; y: number; newScale: number; node: Konva.Node }) {
  const oldScale = node.scaleX()
  const pointer = { x, y }

  const mousePointTo = {
    x: (pointer.x - node.x()) / oldScale,
    y: (pointer.y - node.y()) / oldScale,
  }

  node.scale({ x: newScale, y: newScale })

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  }
  node.position(newPos)
}

const translateDelta = function ({
  target,
  deltaX = 0,
  deltaY = 0,
}: {
  target: Konva.Node
  deltaX: number
  deltaY: number
}) {
  const { x, y } = target.position()
  const newX = x + deltaX
  const newY = y + deltaY
  target.position({ x: newX, y: newY })

  return { newX, newY }
}

export const konvaKit = {
  findParent,
  scaleByPoint,
  translateDelta,
}
