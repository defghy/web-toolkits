import { knowledge } from '../src/knowledge'
import { validateKnowledge } from '../src/knowledge/validate'
const errors = validateKnowledge(knowledge)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else
  console.log(
    `知识数据校验通过：${knowledge.entities.length} 个实体，${knowledge.entries.length} 个入口，${knowledge.relations.length} 条关系。`
  )
