import { dynamicImportWrapper } from '@aweb/pkg-common/v3'

export const VirtualScroll = dynamicImportWrapper(() => import('./VirtualScroll.vue').then(res => res.default))
export const DynamicVirtualScroll = dynamicImportWrapper(() =>
  import('./DynamicVirtualScroll.vue').then(res => res.default)
)
export * from './useVirtual'
