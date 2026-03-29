<template>
  <div class="top-bar-wrap">
    <div class="title-area">
      <div class="filename">{{ filename }}</div>
      <div class="diff-line-num">
        <div class="add">+12</div>
        <div class="del">-111</div>
      </div>
    </div>
    <div class="toolbar">
      <label>
        <input type="checkbox" v-model="viewed" />
        viewed
      </label>
      <label>
        <input type="checkbox" v-model="raw" />
        raw
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    diffPair?: { filename: string; content: string }[]
  }>(),
  {
    diffPair: () => [],
  }
)

const filename = computed(() => props.diffPair[0].filename)

const viewed = ref<boolean>(false)
const raw = ref<boolean>(false)

onMounted(() => {
  // funcs.options.toolbar?.render($el, {})
})
</script>

<style scoped>
.top-bar-wrap {
  box-sizing: border-box;
  height: 32px;

  display: flex;
  overflow: hidden;
  align-items: center;
  background-color: #f7f7f7;
  padding: 4px 8px;

  .title-area {
    flex: 1;
    display: flex;
    align-items: center;

    .filename {
      font-size: 14px;
    }

    .diff-line-num {
      display: inline-flex;
      font-size: 12px;
      font-weight: bold;
      margin-left: 4px;
      .add {
        color: #1a7f37;
      }
      .del {
        color: #d1242f;
      }
    }
  }
  .toolbar {
    font-size: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;

    label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
  }
}
</style>
