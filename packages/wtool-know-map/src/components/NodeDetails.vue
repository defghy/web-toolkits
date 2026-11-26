<script setup lang="ts">
import { computed } from 'vue'
import { index, knowledge } from '../knowledge'
const props = defineProps<{ entryId: string }>()
const emit = defineEmits<{ locate: [id: string] }>()
const entry = computed(() => index.entryById.get(props.entryId)!)
const entity = computed(() => (entry.value.entityId ? index.entityById.get(entry.value.entityId) : undefined))
const related = computed(() => {
  const ids = new Set([
    props.entryId,
    ...(index.ancestorIdsByEntryId.get(props.entryId) ?? []).filter(id => id !== 'root'),
  ])
  return knowledge.relations
    .filter(r =>
      [r.source, r.target].some(end => (end.kind === 'entity' ? end.id === entry.value.entityId : ids.has(end.id)))
    )
    .map(r => {
      const outgoing = r.source.kind === 'entity' ? r.source.id === entry.value.entityId : ids.has(r.source.id)
      const endpoint = outgoing ? r.target : r.source
      const target = endpoint.kind === 'entry' ? endpoint.id : index.entryIdsByEntityId.get(endpoint.id)?.[0]
      return { ...r, target, label: target ? index.entryById.get(target)?.label : endpoint.id }
    })
})
const otherEntries = computed(() =>
  entry.value.entityId
    ? (index.entryIdsByEntityId.get(entry.value.entityId) ?? []).filter(id => id !== props.entryId)
    : []
)
</script>

<template>
  <div class="details" @click.stop @dblclick.stop @pointerdown.stop>
    <p class="kind">{{ entity?.kind ?? '职责分类' }}</p>
    <p class="summary">{{ entity?.summary ?? entry.classificationBasis ?? '此分类内容待补充。' }}</p>
    <a
      v-for="source in entity?.sources"
      :key="source.url"
      class="source"
      :href="source.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ source.title }} ↗
    </a>
    <div v-for="relation in related" :key="relation.id" class="relation">
      <p class="relation-name">{{ relation.description }}</p>
      <p class="context">{{ relation.context }}</p>
      <button v-if="relation.target" class="inline-link" @click="emit('locate', relation.target)">
        定位 {{ relation.label }} ↗
      </button>
    </div>
    <div v-if="otherEntries.length" class="relation">
      <p class="relation-name">同一技术的其他入口</p>
      <button v-for="id in otherEntries" :key="id" class="inline-link other-entry" @click="emit('locate', id)">
        {{ index.searchPaths.get(id) }} ↗
      </button>
    </div>
  </div>
</template>

<style scoped>
.details {
  padding: 0;
  line-height: 1.75;
  color: #31483d;
  overflow-wrap: anywhere;
  font-size: 14px;
  scrollbar-width: thin;
}
.kind {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #63796b;
  margin: 0 0 6px;
}
.summary {
  margin: 0 0 10px;
  max-width: 800px;
}
.source,
.inline-link {
  color: #255b45;
  text-decoration: underline;
  text-underline-offset: 4px;
  font: inherit;
}
.source {
  display: inline-block;
  margin-right: 12px;
}
.relation {
  border-top: 1px solid #526b5826;
  margin-top: 16px;
  padding-top: 12px;
  max-width: 850px;
}
.relation-name {
  margin: 0;
  font-weight: 600;
  font-size: 13px;
}
.context {
  margin: 4px 0;
  font-size: 13px;
  color: #54695c;
}
.inline-link {
  border: 0;
  padding: 2px 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
}
.other-entry {
  display: block;
  margin: 5px 0;
}
</style>
