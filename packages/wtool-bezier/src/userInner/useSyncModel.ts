// 当前实现为内部state，通知外部修改，此时如果外部修改内部，需要同步
import { Ref, watch } from 'vue'
import { isEqual } from 'lodash-es'

export const useSyncModel = function ({ modelValue, updateView }: { modelValue: Ref<any>; updateView: Function }) {
  // 修改完成，此时不watch
  let isChangByMe = false
  const afterChange = function () {
    isChangByMe = true
    setTimeout(() => {
      isChangByMe = false
    }, 100)
  }

  watch(
    () => modelValue.value,
    function (n, o) {
      if (isChangByMe) {
        return
      }
      if (isEqual(n, o)) {
        return
      }

      updateView()
    }
  )

  return { afterChange }
}
