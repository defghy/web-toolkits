<template>
  <div id="app">
    <header class="header">
      <div class="title">wtool-bezier 样例</div>
      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: current === tab.key }"
          @click="current = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
      <a
        class="source-link"
        href="https://stackblitz.com/~/github.com/defghy/web-toolkits?configPath=packages/wtool-bezier&file=packages/wtool-bezier/site/App.vue&initialpath=/web-toolkits/bezier-demo/"
        target="_blank"
      >
        查看代码(stackblitz)
      </a>
    </header>
    <main class="main">
      <keep-alive>
        <component :is="currentComp" />
      </keep-alive>
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import BezierEdit from './examples/BezierEdit.vue'
import BezierTravel from './examples/BezierTravel.vue'
import BezierFlag from './examples/BezierFlag.vue'

const tabs = [
  { key: 'edit', label: '样例1：曲线编辑（增删点）', comp: BezierEdit },
  { key: 'travel', label: '样例2：轨迹动画 + 缓动曲线', comp: BezierTravel },
  { key: 'flag', label: '样例3：标记点增删', comp: BezierFlag },
]

export default defineComponent({
  name: 'App',
  components: { BezierEdit, BezierTravel, BezierFlag },
  setup() {
    const current = ref('edit')
    const currentComp = computed(() => tabs.find(tab => tab.key === current.value)?.comp)

    return { tabs, current, currentComp }
  },
})
</script>

<style>
body,
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #222;
}
.header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  height: 52px;
  background: #1f1f1f;
  color: #fff;
}
.header .title {
  font-weight: bold;
  white-space: nowrap;
}
.header .tabs {
  display: flex;
  gap: 8px;
}
.header .tab {
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  background: #3a3a3a;
  color: #ddd;
  cursor: pointer;
  font-size: 13px;
}
.header .tab.active {
  background: #1677ff;
  color: #fff;
}
.header .source-link {
  margin-left: auto;
  font-size: 13px;
  color: #91caff;
  white-space: nowrap;
}
.main {
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
}
</style>
