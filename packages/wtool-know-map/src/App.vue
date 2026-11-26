<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import MapSearch from './components/MapSearch.vue'
import KnowledgeTree from './components/KnowledgeTree.vue'
import { useKnowledgeTree } from './composables/useKnowledgeTree'

const { state, locate, toggle, activate, setActive, escape } = useKnowledgeTree()
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !event.defaultPrevented) {
    escape()
    event.preventDefault()
  }
}
onMounted(() => window.addEventListener('keydown', keydown))
onUnmounted(() => window.removeEventListener('keydown', keydown))
</script>

<template>
  <div class="page">
    <MapSearch @locate="locate" />
    <KnowledgeTree :state="state" @locate="locate" @toggle="toggle" @activate="activate" @active="setActive" />
  </div>
</template>
