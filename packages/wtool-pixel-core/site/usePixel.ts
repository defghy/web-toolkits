import { inject, provide, Ref } from 'vue'

import type { PixelPaletteInst } from './types'

const pixelRefKey = 'sitePixelRef'

export const providePixelRef = function (pixelRef: Ref<PixelPaletteInst>) {
  provide(pixelRefKey, pixelRef)
}

export const usePixelRef = function () {
  return inject<Ref<PixelPaletteInst>>(pixelRefKey)
}
