import type { WtoolMonacoDiffProps } from './props'
import { register, WtoolMonacoDiff } from './custom-element'

export type MonacoEditorProps = WtoolMonacoDiffProps

export interface MonacoEditorInstance {
  update(props: Partial<MonacoEditorProps>): void
  destroy(): void
}

function applyProps(el: InstanceType<typeof WtoolMonacoDiff>, props: Partial<MonacoEditorProps>): void {
  const node = el as unknown as Record<string, unknown>
  for (const key of Object.keys(props) as (keyof MonacoEditorProps)[]) {
    const v = props[key]
    if (v !== undefined) {
      node[key as string] = v
    }
  }
}

export function createMonacoDiff(target: HTMLElement, initialProps: MonacoEditorProps = {}): MonacoEditorInstance {
  register()
  const el = new WtoolMonacoDiff()

  applyProps(el, initialProps)

  if (initialProps.width === undefined) {
    el.style.width = '100%'
  }
  if (initialProps.height === undefined) {
    el.style.height = '100%'
  }

  target.appendChild(el)

  return {
    update(newProps: Partial<MonacoEditorProps>) {
      applyProps(el, newProps)
    },
    destroy() {
      el.remove()
    },
  }
}
