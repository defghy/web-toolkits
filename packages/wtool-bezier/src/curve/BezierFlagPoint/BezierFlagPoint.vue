<template>
  <KGroup>
    <FlagPoint
      v-for="(flagPoint, index) in data.flagPoints"
      :key="flagPoint.key"
      :flagPoint="flagPoint"
      :index="index"
    />
  </KGroup>
</template>

<script lang="ts">
// 一条曲线，由曲线片段和可选动画小球组成
import { PropType, computed, defineComponent, ref, onBeforeMount, toRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { merge, cloneDeep, debounce } from 'lodash-es'
import { useCompatModel, KonvaComps } from '../../common'

import FlagPoint from './FlagPoint.vue'
import { BezierCurveSingle } from '../../types'
import { useInner, useSingleCurveInner } from '../../userInner'
import { useFlagPoint, useFlagCRUD } from './useFlagPoint'

const { KStage, KLayer, KGroup, KRect } = KonvaComps

export default defineComponent({
  name: 'FlagPoints',
  components: {
    KGroup,
    FlagPoint,
  },
  props: {
    data: { type: Object as PropType<BezierCurveSingle> },
  },
  emits: ['change', 'delete'],
  setup(props, { emit }) {
    const { funcs } = useInner()
    const { funcs: singleFuncs, registerFunc: singleRegister } = useSingleCurveInner()
    const { autoAdjustFlagPointsDelay } = useFlagPoint({ singleFuncs })
    const flagCRUD = useFlagCRUD({
      flagPoints: computed(() => props.data.flagPoints),
      funcs,
      singleFuncs,
    })

    singleRegister({
      crud: { ...singleFuncs.crud, ...flagCRUD },
    })

    const onCurveUpdated = function () {
      autoAdjustFlagPointsDelay({ flagPoints: props.data.flagPoints })
    }

    onBeforeMount(() => {
      funcs.when({
        onCurveUpdated,
      })
    })
    onBeforeUnmount(() => {
      funcs.whenUnbind({
        onCurveUpdated,
      })
    })

    return {}
  },
})
</script>

<style scoped></style>
