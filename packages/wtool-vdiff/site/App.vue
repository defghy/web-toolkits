<template>
  <div class="app">
    <h1>wtool-vdiff</h1>

    <div class="view-switch" role="radiogroup" aria-label="Diff view">
      <label :class="{ active: viewMode === 'files' }">
        <input v-model="viewMode" type="radio" value="files" />
        <span>FileList</span>
      </label>
      <label :class="{ active: viewMode === 'single' }">
        <input v-model="viewMode" type="radio" value="single" />
        <span>File</span>
      </label>
    </div>

    <section v-if="viewMode === 'files'">
      <h2>Files diff explorer</h2>
      <MultiFileComp />
    </section>
    <section v-else>
      <h2>DiffViewer Vue</h2>
      <DirectComp />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import DirectComp from './DirectComp.vue'
import MultiFileComp from './MultiFileComp.vue'

const viewMode = ref<'files' | 'single'>('single')
</script>

<style>
.app {
  max-width: 960px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 12px;
}

.view-switch {
  display: inline-flex;
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid #cbd2d9;
  border-radius: 6px;
}

.view-switch label {
  min-width: 96px;
  padding: 8px 16px;
  border-right: 1px solid #cbd2d9;
  color: #46515c;
  text-align: center;
  background: #fff;
  cursor: pointer;
  user-select: none;
}

.view-switch label:last-child {
  border-right: 0;
}

.view-switch label.active {
  color: #fff;
  background: #1261a6;
}

.view-switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.view-switch label:focus-within {
  box-shadow: inset 0 0 0 2px #7ab8ec;
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
