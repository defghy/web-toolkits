import { defineCustomElement } from 'vue'
import type { WtoolDiffViewerProps } from '../props'
import DiffViewer from './DiffViewer.vue'

export type DiffViewerProps = WtoolDiffViewerProps

export const WTOOL_DIFF_VIEWER_TAG = 'wtool-diff-viewer'

export const WtoolDiffViewer = defineCustomElement(DiffViewer, {
  shadowRoot: false,
})

export function register(tagName: string = WTOOL_DIFF_VIEWER_TAG): void {
  if (customElements.get(tagName)) return
  customElements.define(tagName, WtoolDiffViewer)
}

export interface DiffViewerInstance {
  update(props: Partial<DiffViewerProps>): void
  destroy(): void
}

function applyProps(el: InstanceType<typeof WtoolDiffViewer>, props: Partial<DiffViewerProps>): void {
  const node = el as unknown as Record<string, unknown>
  for (const key of Object.keys(props) as (keyof DiffViewerProps)[]) {
    const v = props[key]
    if (v !== undefined) {
      node[key as string] = v
    }
  }
}

export function createDiffViewer(target: HTMLElement, initialProps: DiffViewerProps = {}): DiffViewerInstance {
  register()
  const el = new WtoolDiffViewer()

  applyProps(el, initialProps)

  if (initialProps.width === undefined) {
    el.style.width = '100%'
  }
  if (initialProps.height === undefined) {
    el.style.height = '100%'
  }

  target.appendChild(el)

  return {
    update(newProps: Partial<DiffViewerProps>) {
      applyProps(el, newProps)
    },
    destroy() {
      el.remove()
    },
  }
}
