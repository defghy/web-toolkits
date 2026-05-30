import type Konva from 'konva'
import PixelPalette from './PixelPalette.vue'

export type PixelPaletteInst = InstanceType<typeof PixelPalette>

export interface PixelGridData {
  color: string
  disabled?: boolean
  [key: string]: any
}

export interface PixelLayerData {
  id: string
  name: string
  zIndex: number
  grids: PixelGridData[][]
}

export interface PressEvent {
  evt: PointerEvent
  currGrid: PixelGridData
  r: number
  c: number
  passByGrids: { r: number; c: number; grid: PixelGridData }[]
  layerId: PixelLayerData['id']
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
