<template>
  <transition name="xfade" @after-leave="handleAfterLeave">
    <div v-show="visible" class="m-loading-mask" :class="[customClass]" :style="customStyle">
      <div class="loading-animate" :style="containerStyle">
        <div
          v-for="(item, index) in animateOptions"
          :key="item.id"
          class="loading-animate-column"
          :style="getColumnStyle(index)"
        />
      </div>
      <p v-if="text" class="m-loading-text">{{ text }}</p>
    </div>
  </transition>
</template>

<script lang="ts">
/**
 * External dependencies
 */
import { defineComponent, reactive, ref, computed } from 'vue'

export default defineComponent({
  name: 'kx-loading',
  props: {
    text: String,
    customClass: { type: String, default: '' },
    customStyle: { default: () => ({}) },
    size: { type: String, default: 'medium' },
  },
  setup(props, { emit }) {
    const visible = ref(false)
    const animateOptions = ref([
      {
        id: 0,
        delay: 0,
      },
      {
        id: 1,
        delay: 0.15,
      },
      {
        id: 2,
        delay: 0.3,
      },
    ])

    const px = num => `${num}px`

    const sizeInfo = computed(() => {
      return {
        medium: { width: 4, height: 10 },
        mini: { width: 2, height: 6 },
      }[props.size] as any
    })

    const containerStyle = computed(() => {
      const info = sizeInfo.value
      return {
        '--column-width': px(info.width),
        '--column-height': px(info.height),
        width: px(info.width * 2 * 3),
      }
    })

    const getColumnStyle = function (index: number) {
      return {
        left: px(index * sizeInfo.value.width * 2),
        backgroundColor: '#327dff',
        animationDelay: `${0.15 * index}s`,
      }
    }

    function handleAfterLeave() {
      emit('after-leave')
    }
    return { visible, animateOptions, getColumnStyle, handleAfterLeave, containerStyle }
  },
})
</script>

<style lang="less">
.m-loading-parent--relative {
  position: relative;
}
</style>

<style lang="less" scoped>
.m-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
}

@keyframes widgetLoading {
  0% {
    opacity: 0.2;
    transform: translateY(var(--column-height)) scaleY(1);
  }

  50% {
    opacity: 1;
    transform: translateY(calc(var(--column-height) / 2)) scaleY(2);
  }

  100% {
    opacity: 0.2;
    transform: translateY(var(--column-height)) scaleY(1);
  }
}

.loading-animate {
  height: 30px;
  position: relative;
  .loading-animate-column {
    position: absolute;
    width: var(--column-width);
    height: var(--column-height);
    opacity: 0.2;
    animation: 0.6s ease-in-out 0s infinite widgetLoading;
    transform: translateY(var(--column-height)) scaleY(1);
    transform-origin: top;
  }
}

// 渐进动画
.xfade {
  &-enter,
  &-enter-from {
    opacity: 0;
  }
  &-enter-active {
    transition: opacity 400ms ease;
  }
  &-leave-active {
    transition: opacity 400ms ease;
    opacity: 0;
  }
}
</style>
