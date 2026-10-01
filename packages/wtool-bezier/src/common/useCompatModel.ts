// vue2/vue3 兼容的 v-model 实现
export const useCompatModel = function (emit: Function) {
  const modelChange = function (newVal, ...args) {
    emit('update:modelValue', newVal, ...args)
    emit('change', newVal, ...args)
  }
  return { modelChange }
}
useCompatModel.model = {
  prop: 'modelValue',
  event: 'update:modelValue',
}
