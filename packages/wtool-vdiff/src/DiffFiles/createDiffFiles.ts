import { defineCustomElement } from 'vue'
import type { WtoolDiffFilesProps } from '../types'
import DiffFiles from './DiffFiles.vue'
import type { DiffFileSelection } from './FileExplore/fileTree'

export type DiffFilesProps = WtoolDiffFilesProps
export type DiffFilesSelectFileListener = (selection: DiffFileSelection) => void

export const WTOOL_DIFF_FILES_TAG = 'wtool-diff-files'

export const WtoolDiffFiles = defineCustomElement(DiffFiles, {
  shadowRoot: false,
})

export function register(tagName: string = WTOOL_DIFF_FILES_TAG): void {
  if (customElements.get(tagName)) return
  customElements.define(tagName, WtoolDiffFiles)
}

export interface DiffFilesInstance {
  update(props: Partial<DiffFilesProps>): void
  onSelectFile(listener: DiffFilesSelectFileListener): () => void
  destroy(): void
}

function applyProps(el: InstanceType<typeof WtoolDiffFiles>, props: Partial<DiffFilesProps>): void {
  const node = el as unknown as Record<string, unknown>
  for (const key of Object.keys(props) as (keyof DiffFilesProps)[]) {
    const value = props[key]
    if (value !== undefined) {
      node[key as string] = value
    }
  }
}

export function createDiffFiles(target: HTMLElement, initialProps: DiffFilesProps = {}): DiffFilesInstance {
  register()
  const el = new WtoolDiffFiles()
  const selectFileListeners = new Set<EventListener>()

  applyProps(el, initialProps)
  target.appendChild(el)

  return {
    update(newProps: Partial<DiffFilesProps>) {
      applyProps(el, newProps)
    },
    onSelectFile(listener: DiffFilesSelectFileListener) {
      const eventListener: EventListener = event => {
        const [selection] = (event as CustomEvent<[DiffFileSelection]>).detail
        listener(selection)
      }

      selectFileListeners.add(eventListener)
      el.addEventListener('select-file', eventListener)

      return () => {
        selectFileListeners.delete(eventListener)
        el.removeEventListener('select-file', eventListener)
      }
    },
    destroy() {
      selectFileListeners.forEach(listener => {
        el.removeEventListener('select-file', listener)
      })
      selectFileListeners.clear()
      el.remove()
    },
  }
}
