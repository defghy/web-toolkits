<template>
  <div class="app">
    <h1>wtool-vdiff</h1>
    <!-- <section>
      <h2>DiffViewer（new Widget）</h2>
      <WidgetComp />
    </section> -->
    <section>
      <h2>DiffViewer Vue</h2>
      <DirectComp />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import WidgetComp from './WidgetComp.vue'
import DirectComp from './DirectComp.vue'
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
