<template>
  <div class="app">
    <h1>wtool-diff 开发测试</h1>
    <section>
      <h2>Svelte Counter 组件</h2>
      <div ref="counterContainer"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { mount, unmount } from 'svelte'
import Counter from '../src/Counter.svelte'

const counterContainer = ref<HTMLElement>()
let component: Record<string, any> | undefined

onMounted(() => {
  if (counterContainer.value) {
    component = mount(Counter, { target: counterContainer.value })
  }
})

onUnmounted(() => {
  if (component) {
    unmount(component)
  }
})
</script>

<style>
.app {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 12px;
}

section {
  margin-top: 24px;
}

h2 {
  color: #555;
  font-size: 18px;
  margin-bottom: 12px;
}
</style>
