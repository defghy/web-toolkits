import type { PixelPaletteInst } from '@yuhufe/wtool-pixel-core'

export type { PixelPaletteInst }

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
