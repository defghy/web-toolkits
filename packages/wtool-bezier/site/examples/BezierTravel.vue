<template>
  <div class="example">
    <div class="toolbar">
      <button class="btn primary" @click="play">播放</button>
      <button class="btn" @click="pause">暂停</button>
      <button class="btn" @click="resume">恢复</button>
      <button class="btn" @click="stop">停止</button>

      <label class="field">
        时长(ms)
        <input v-model.number="duration" type="number" step="100" min="200" class="input" />
      </label>
      <label class="field">
        <input v-model="cycle" type="checkbox" />
        循环播放
      </label>

      <button class="btn" @click="resetEasing">重置缓动</button>
    </div>

    <div class="body">
      <div class="editor-box">
        <BezierEditor ref="editorRef" :modelValue="curves" :plugins="plugins" @change="onChange" />
      </div>
      <div class="easing-panel">
        <div class="panel-title">缓动曲线（x：时间进度，y：动画进度）</div>
        <div class="easing-box">
          <EasingCurve v-model="easingModel" />
        </div>
        <div class="panel-tip">滚轮 + Ctrl 缩放；鼠标中键拖拽平移。</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import {
  BezierEditor,
  EasingCurve,
  EasingType,
  PluginFlagPoint,
  PluginTravel,
  useBezier,
  type BezierCurveSingle,
  type BezierCurveModel,
  type FlagPoint,
} from '@yuhufe/wtool-bezier'

const createEasingCurves = (): BezierCurveModel[] => [
  {
    id: 'easing-seg-1',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    startCtrl: { x: 0.25, y: 0.1 },
    endCtrl: { x: 0.24, y: 0.89 },
  },
]

const createCurve = (): BezierCurveSingle => ({
  id: 'curve-travel',
  flagPoints: [],
  trail: { enable: true, cycle: false },
  curveSegs: [
    {
      id: 'seg-1',
      start: { x: 120, y: 360 },
      end: { x: 260, y: 120 },
      startCtrl: { x: 120, y: 200 },
      endCtrl: { x: 300, y: 120 },
    },
    {
      id: 'seg-2',
      start: { x: 260, y: 120 },
      end: { x: 560, y: 320 },
      startCtrl: { x: 420, y: 120 },
      endCtrl: { x: 440, y: 320 },
    },
  ],
})

export default defineComponent({
  name: 'BezierTravel',
  components: { BezierEditor, EasingCurve },
  setup() {
    const editorRef = ref()
    const { travel } = useBezier({ comp: editorRef })

    const duration = ref(2000)
    const cycle = ref(false)
    const curveData = ref<BezierCurveSingle>(createCurve())
    const easingModel = ref<{ easingData: BezierCurveModel[]; flagPoints: FlagPoint[] }>({
      easingData: createEasingCurves(),
      flagPoints: [],
    })

    const curves = computed<BezierCurveSingle[]>(() => [
      {
        ...curveData.value,
        trail: { enable: true, cycle: cycle.value },
        easingData: {
          type: EasingType.bezier,
          duration: duration.value,
          params: { curves: easingModel.value.easingData },
        },
      },
    ])

    const onChange = (newVal: BezierCurveSingle[]) => {
      curveData.value = newVal[0]
    }

    const play = () => travel.start({ randomDisturb: 0 })
    const pause = () => travel.pause()
    const resume = () => travel.resume()
    const stop = () => travel.stop()
    const resetEasing = () => {
      easingModel.value = { easingData: createEasingCurves(), flagPoints: [] }
    }

    return {
      editorRef,
      travel,
      duration,
      cycle,
      curveData,
      easingModel,
      curves,
      onChange,
      play,
      pause,
      resume,
      stop,
      resetEasing,
      plugins: [PluginFlagPoint, PluginTravel],
    }
  },
})
</script>

<style scoped>
.example {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.btn.primary {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}
.field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
}
.input {
  width: 80px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-sizing: border-box;
}
.body {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}
.editor-box {
  flex: 1;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
}
.easing-panel {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.panel-title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 8px;
}
.easing-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #434343;
  border-radius: 6px;
  overflow: hidden;
}
.panel-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #888;
}
</style>
