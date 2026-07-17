<template>
  <div class="file-search">
    <input
      class="file-search__input"
      type="search"
      v-model="searchKeyword"
      :placeholder="placeholder"
      autocomplete="off"
      spellcheck="false"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'es-toolkit'
import { useFileExplore } from './useFileExplore'

withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: 'Search files',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { funcs, registerFunc } = useFileExplore()
const searchKeyword = ref('')
registerFunc({
  searchKeyword,
})

const handleInput = debounce((event: Event) => {
  funcs.filterTree((event.target as HTMLInputElement).value)
}, 300)
</script>

<style lang="less" scoped>
.file-search {
  flex: 0 0 auto;
  padding: 8px 9px;
  border-bottom: 1px solid #dfe3e8;
  box-sizing: border-box;
  background: #fff;
}

.file-search__input {
  width: 100%;
  height: 32px;
  padding: 4px 9px;
  border: 1px solid #cbd2d9;
  border-radius: 4px;
  box-sizing: border-box;
  color: #252a31;
  background: #fff;
  font: inherit;
  font-size: 13px;
  letter-spacing: 0;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #8a929c;
  }

  &:hover {
    border-color: #7aaed8;
  }

  &:focus {
    border-color: #2979b8;
    box-shadow: 0 0 0 2px rgb(41 121 184 / 16%);
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
}
</style>
