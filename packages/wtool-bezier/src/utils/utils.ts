import { BezierCurveInfo, Point } from '../types'

// 坐标系转换
export const polar2Rect = function ({
  magnitude,
  angle,
  originPoint,
}: {
  magnitude: number
  angle: number
  originPoint: Point
  [key: string]: any
}) {
  const { x: ox, y: oy } = originPoint
  return {
    x: ox + magnitude * Math.cos(angle),
    y: oy + magnitude * Math.sin(angle),
  }
}
export const rect2Polar = function ({ origin, target }: { origin: Point; target: Point }) {
  const xDelta = target.x - origin.x
  const yDelta = target.y - origin.y

  return {
    magnitude: Math.sqrt(xDelta ** 2 + yDelta ** 2),
    angle: Math.atan2(yDelta, xDelta),
  }
}

// screen 和 Cartesian 坐标系转换
export const screen2Cartesian = function ({ origin, screenPoint }: { origin: Point; screenPoint: Point }) {
  return {
    x: screenPoint.x - origin.x,
    y: origin.y - screenPoint.y,
  }
}
export const cartesian2Screen = function ({ origin, cartesPoint }: { origin; cartesPoint: Point }) {
  return {
    x: cartesPoint.x + origin.x,
    y: origin.y - cartesPoint.y,
  }
}

export const coordUtil = {
  polar2Rect,
  rect2Polar,
  screen2Cartesian,
  cartesian2Screen,
  sub(coord1: Point, coord2: Point) {
    return {
      x: coord1.x - coord2.x,
      y: coord1.y - coord2.y,
    }
  },
  add(coord1: Point, coord2: Point) {
    return {
      x: coord1.x + coord2.x,
      y: coord1.y + coord2.y,
    }
  },
  // 控制angle在-pi和pi之间
  normalizeAngle(angle: number) {
    while (angle > Math.PI) {
      angle -= 2 * Math.PI
    }
    while (angle < -Math.PI) {
      angle += 2 * Math.PI
    }
    return angle
  },
}

export function createCurveInfo(info: any) {
  return {
    ...info,
    id: info.id || crypto.randomUUID(), // 必须有id
  } as BezierCurveInfo
}
