import { mount, unmount } from 'svelte'
import type * as Monaco from 'monaco-editor'
import MonacoEditor from './MonacoEditor.svelte'

type DiffEditorOptions = Monaco.editor.IStandaloneDiffEditorConstructionOptions
type ModelOptions = Monaco.editor.ITextModelUpdateOptions

export interface MonacoEditorProps {
  originalCode?: string
  modifiedCode?: string
  language?: string
  options?: DiffEditorOptions
  modelOptions?: ModelOptions
  width?: string
  height?: string
}

export interface MonacoEditorInstance {
  update(props: Partial<MonacoEditorProps>): void
  destroy(): void
}

export function createMonacoEditor(
  target: HTMLElement,
  initialProps: MonacoEditorProps = {},
): MonacoEditorInstance {
  let props = $state<MonacoEditorProps>({ ...initialProps })

  const component = mount(MonacoEditor, { target, props })

  return {
    update(newProps: Partial<MonacoEditorProps>) {
      Object.assign(props, newProps)
    },
    destroy() {
      unmount(component)
    },
  }
}
