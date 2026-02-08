/// <reference types="vite/client" />

declare module '*.svelte' {
  import type { Component } from 'svelte'
  const component: Component
  export default component
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
