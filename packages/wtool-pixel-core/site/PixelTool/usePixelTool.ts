import { ref } from 'vue'

const svgs = import.meta.glob('./icons/*', { eager: true, query: '?url', import: 'default' })

interface ToolItem {
  name: ToolType
  icon: any
  desc: string
}

export enum ToolType {
  pen = 'pen',
  eraser = 'eraser',
  move = 'move',
  dropper = 'dropper',
  paintBucket = 'paintBucket',
  quill = 'quill',
  select = 'select',
  pastePreset = 'pastePreset',
}

const tools = ref<ToolItem[]>([
  {
    name: ToolType.pen,
    desc: '笔刷',
    icon: svgs['./icons/pencil.svg'],
  },
  {
    name: ToolType.eraser,
    desc: '橡皮',
    icon: svgs['./icons/eraser.svg'],
  },
  {
    name: ToolType.paintBucket,
    desc: '颜料桶',
    icon: svgs['./icons/paintBucket.svg'],
  },
  {
    name: ToolType.dropper,
    desc: '滴管',
    icon: svgs['./icons/dropper.svg'],
  },
  {
    name: ToolType.move,
    desc: '移动',
    icon: svgs['./icons/move.svg'],
  },
])

const activeTool = ref(ToolType.pen)
const toolForm = ref({
  color: 'red',
})

export const useTool = function () {
  return { tools, activeTool, toolForm }
}
