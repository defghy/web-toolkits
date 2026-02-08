import { mount, unmount } from 'svelte'
import Counter from './Counter.svelte'

export interface CounterProps {
  msg?: string
}

export interface CounterInstance {
  update(props: Partial<CounterProps>): void
  destroy(): void
}

export function createCounter(
  target: HTMLElement,
  initialProps: CounterProps = {},
): CounterInstance {
  let props = $state<CounterProps>({ ...initialProps })

  const component = mount(Counter, { target, props })

  return {
    update(newProps: Partial<CounterProps>) {
      Object.assign(props, newProps)
    },
    destroy() {
      unmount(component)
    },
  }
}
