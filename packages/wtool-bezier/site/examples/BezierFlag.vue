<template>
  <div class="example">
    <div class="toolbar">
      <div class="tools">
        <button class="tool" :class="{ active: mode === BezierEditMode.flag }" @click="toggle(BezierEditMode.flag)">
          新增标记
        </button>
        <button class="tool" :class="{ active: mode === BezierEditMode.del }" @click="toggle(BezierEditMode.del)">
          删除标记
        </button>
        <button class="tool" :class="{ active: mode === BezierEditMode.common }" @click="toggle(BezierEditMode.common)">
          常规
        </button>
      </div>
      <button class="tool" @click="addRandom">程序化随机新增</button>
      <div class="tips">新增模式：点击曲线新增标记点；删除模式：点击标记点删除。</div>
    </div>

    <div class="body">
      <div class="editor-box">
        <BezierEditor ref="editorRef" :modelValue="curves" :plugins="plugins" @change="onChange" />
      </div>
      <div class="panel">
        <div class="panel-title">标记点列表（{{ flagPoints.length }}）</div>
        <ul class="flag-list">
          <li v-for="(flagPoint, index) in flagPoints" :key="flagPoint.key" class="flag-item">
            <span class="dot" :style="{ background: colors[index % colors.length] }"></span>
            <span class="name">#{{ index + 1 }}</span>
            <span class="progress">进度 {{ formatProgress(flagPoint.progress) }}</span>
            <button class="del" @click="delFlag(flagPoint.key)">删除</button>
          </li>
          <li v-if="!flagPoints.length" class="empty">暂无标记点，切换到“新增标记”后在曲线上点击新增</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { BezierEditor, BezierEditMode, PluginFlagPoint, useBezier, type BezierCurveSingle } from '@yuhufe/wtool-bezier'

const CURVE_ID = 'curve-flag'

const createCurve = (): BezierCurveSingle => ({
  id: CURVE_ID,
  flagPoints: [],
  curveSegs: [
    {
      id: 'seg-1',
      start: { x: 120, y: 340 },
      end: { x: 520, y: 160 },
      startCtrl: { x: 260, y: 120 },
      endCtrl: { x: 400, y: 340 },
    },
  ],
})

const colors = ['#6929c4', '#1192e8', '#005d5d', '#9f1853', '#fa4d56', '#198038']

export default defineComponent({
  name: 'BezierFlag',
  components: { BezierEditor },
  setup() {
    const editorRef = ref()
    const { toggleMode, getEditMode, getSingleFuncs, selectGrpCurve } = useBezier({ comp: editorRef })
    const curveData = ref<BezierCurveSingle>(createCurve())
    const mode = computed(() => getEditMode())
    const curves = computed(() => [curveData.value])
    const flagPoints = computed(() => curveData.value.flagPoints || [])

    onMounted(() => selectGrpCurve(CURVE_ID))

    const toggle = (target: BezierEditMode) => toggleMode(target)
    const onChange = (newVal: BezierCurveSingle[]) => {
      curveData.value = newVal[0]
    }

    const delFlag = (key: string) => {
      getSingleFuncs(CURVE_ID)?.crud.delFlagPoint(key)
    }
    const addRandom = () => {
      const pos = {
        x: 140 + Math.random() * 400,
        y: 140 + Math.random() * 200,
      }
      getSingleFuncs(CURVE_ID)?.crud.addFlagPointByPos({ pos })
    }

    const formatProgress = (progress?: number) => (typeof progress === 'number' ? progress.toFixed(3) : '-')

    return {
      editorRef,
      mode,
      curves,
      flagPoints,
      toggle,
      onChange,
      delFlag,
      addRandom,
      formatProgress,
      colors,
      BezierEditMode,
      plugins: [PluginFlagPoint],
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
  gap: 12px;
  margin-bottom: 10px;
}
.tools {
  display: flex;
  gap: 8px;
}
.tool {
  height: 30px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.tool.active {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
}
.tips {
  font-size: 12px;
  color: #888;
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
.panel {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;
}
.panel-title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 10px;
}
.flag-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.flag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.name {
  width: 30px;
}
.progress {
  flex: 1;
  color: #888;
  font-size: 12px;
}
.del {
  border: none;
  background: transparent;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 12px;
}
.empty {
  color: #aaa;
  font-size: 12px;
  line-height: 1.8;
}
</style>
