import { defineCustomElement } from 'vue'
import MonacoDiffViewer from './MonacoDiffViewer.vue'

export const WTOOL_MONACO_DIFF_TAG = 'wtool-monaco-diff'

export const WtoolMonacoDiff = defineCustomElement(MonacoDiffViewer, {
  shadowRoot: false,
})

export function register(tagName: string = WTOOL_MONACO_DIFF_TAG): void {
  if (customElements.get(tagName)) return
  customElements.define(tagName, WtoolMonacoDiff)
}
