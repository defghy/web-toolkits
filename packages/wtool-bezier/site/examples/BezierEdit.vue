<template>
  <div class="example">
    <div class="toolbar">
      <div class="tools">
        <button class="tool" :class="{ active: mode === BezierEditMode.add }" @click="toggle(BezierEditMode.add)">
          新增控制点
        </button>
        <button class="tool" :class="{ active: mode === BezierEditMode.del }" @click="toggle(BezierEditMode.del)">
          删除控制点
        </button>
        <button class="tool" :class="{ active: mode === BezierEditMode.common }" @click="toggle(BezierEditMode.common)">
          常规
        </button>
      </div>
      <div class="tips">新增模式：点击曲线分割曲线，点击空白追加曲线；删除模式：点击曲线 / 控制点 / 端点删除。</div>
      <button class="reset" @click="reset">重置数据</button>
    </div>

    <div class="body">
      <div class="editor-box">
        <BezierEditor ref="editorRef" :modelValue="curves" :plugins="plugins" @change="onChange" />
      </div>
      <pre class="data">{{ serialize }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { BezierEditor, BezierEditMode, PluginFlagPoint, useBezier, type BezierCurveSingle } from '@yuhufe/wtool-bezier'

const createCurve = (): BezierCurveSingle => ({
  id: 'curve-edit',
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

export default defineComponent({
  name: 'BezierEdit',
  components: { BezierEditor },
  setup() {
    const editorRef = ref()
    const { toggleMode, getEditMode } = useBezier({ comp: editorRef })
    const curves = ref<BezierCurveSingle[]>([createCurve()])
    const mode = computed(() => getEditMode())

    const toggle = (target: BezierEditMode) => toggleMode(target)
    const onChange = (newVal: BezierCurveSingle[]) => {
      curves.value = newVal
    }
    const reset = () => {
      curves.value = [createCurve()]
    }

    return {
      editorRef,
      curves,
      mode,
      toggle,
      onChange,
      reset,
      BezierEditMode,
      plugins: [PluginFlagPoint],
      serialize: computed(() => JSON.stringify(curves.value, null, 2)),
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
.tool,
.reset {
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
.reset {
  margin-left: auto;
}
.tips {
  font-size: 12px;
  color: #888;
}
.body {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
}
.editor-box {
  flex: 1;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
}
.data {
  width: 340px;
  margin: 0;
  padding: 12px;
  box-sizing: border-box;
  background: #1f1f1f;
  color: #b7eb8f;
  font-size: 12px;
  line-height: 1.6;
  overflow: auto;
  border-radius: 6px;
}
</style>
