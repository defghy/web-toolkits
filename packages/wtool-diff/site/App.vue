<template>
  <div class="app">
    <h1>wtool-diff 开发测试</h1>
    <section>
      <h2>Counter 组件 (命令式 API)</h2>
      <div ref="counterContainer"></div>
      <button class="action-btn" @click="updateMsg">更新 msg</button>
      <button class="action-btn" @click="resetMsg">重置 msg</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createCounter } from '../dist/diff-view.es.js'

const counterContainer = ref<HTMLElement>()
let widget: any

onMounted(() => {
  if (counterContainer.value) {
    widget = createCounter(counterContainer.value, { msg: 'hello from Vue' })
  }
})

const updateMsg = () => {
  widget?.update({ msg: `updated at ${new Date().toLocaleTimeString()}` })
}

const resetMsg = () => {
  widget?.update({ msg: 'hello from Vue' })
}

onUnmounted(() => {
  widget?.destroy()
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

.action-btn {
  margin-top: 12px;
  margin-right: 8px;
  padding: 6px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.action-btn:hover {
  background: #f0f0f0;
}
</style>
