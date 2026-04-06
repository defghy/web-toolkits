<template>
  <div class="app">
    <h1>wtool-vdiff（Vue3）</h1>
    <p class="hint">
      使用
      <code>createDiffViewer(容器, props)</code>
      ，与
      <code>createMonacoDiff</code>
      用法一致；底层为 Web Component（亦可
      <code>registerDiffViewer()</code>
      后
      <code>new WtoolDiffViewer()</code>
      ）。
    </p>
    <section>
      <h2>DiffViewer（diffPair）</h2>
      <WidgetComp />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import WidgetComp from './WidgetComp.vue'
</script>

<style>
.app {
  max-width: 960px;
  margin: 40px auto;
  padding: 0 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h1 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 12px;
}

.hint {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
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
