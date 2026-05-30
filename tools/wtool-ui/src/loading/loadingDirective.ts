import { createApp } from 'vue'
import type { App, Plugin, ObjectDirective } from 'vue'
import Loading from './Loading.vue'

interface LoadingInstance {
  app: App
  vm: any
  dom: HTMLElement
}

const LoadingFactory = {
  create(el: any, props: Record<string, any>): void {
    const dom = document.createElement('div')
    const app = createApp(Loading, props)
    const vm = app.mount(dom)
    el._loadingInstance = { app, vm, dom } as LoadingInstance
  },

  destroy(el: any): void {
    const instance: LoadingInstance | undefined = el._loadingInstance
    if (!instance) return
    instance.app.unmount()
    instance.dom.remove()
    delete el._loadingInstance
  },

  getLoadingDom(el: any): HTMLElement | undefined {
    return (el._loadingInstance as LoadingInstance | undefined)?.dom
  },
}

const toggleLoading = (el: any, value: boolean) => {
  const instance: LoadingInstance | undefined = el._loadingInstance
  if (instance) {
    ;(instance.vm as any).visible = value
  }
}

const getStyle = (element: any, styleName: any): string | null => {
  if (!element || !styleName) return null
  try {
    const computed = document.defaultView?.getComputedStyle(element, '')
    return (element.style[styleName] || computed?.[styleName]) ?? null
  } catch (e) {
    return element.style[styleName]
  }
}

const loadingDirective: ObjectDirective = {
  mounted(el: any, binding) {
    const position = getStyle(el, 'position')
    const { modifiers } = binding

    if (!modifiers?.fullscreen && (!position || position === 'static')) {
      el.classList.add('m-loading-parent--relative')
    }

    const props: Record<string, any> = {}
    if (modifiers?.mini) {
      props.size = 'mini'
    }

    LoadingFactory.create(el, props)

    const maskDom = LoadingFactory.getLoadingDom(el)!
    if (modifiers?.fullscreen) {
      document.body.appendChild(maskDom)
    } else {
      el.appendChild(maskDom)
    }

    if (binding.value) {
      toggleLoading(el, true)
    }
  },

  updated(el: any, binding) {
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, !!binding.value)
    }
  },

  unmounted(el: any, binding) {
    toggleLoading(el, false)
    LoadingFactory.destroy(el)
  },
}

const loadingPlugin: Plugin = {
  install(app: App) {
    app.directive('loading', loadingDirective)
  },
}

export { loadingDirective }
export default loadingPlugin
