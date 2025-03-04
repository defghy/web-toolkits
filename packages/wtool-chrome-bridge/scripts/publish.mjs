import { promises as fsp } from 'fs'
import path from 'path'
import { $ } from 'execa'

import packageJson from '../package.json' assert { type: 'json' }

// 修改package.json
const changePackage = function (newJson) {
  const packageJsonPath = path.resolve('./package.json')
  const content = JSON.stringify(newJson, null, 2)
  return fsp.writeFile(packageJsonPath, content)
}

const run = async function () {
  // build
  const { stdout } = await $`npm run build`
  console.log(stdout)

  // prepublish
  const newJson = JSON.parse(JSON.stringify(packageJson))

  Object.assign(newJson, {
    name: '@yuhufe/browser-bridge',
    private: false,
  })
  Object.keys(newJson.dependencies).forEach(key => {
    if (key.startsWith('@aweb')) {
      Reflect.deleteProperty(newJson.dependencies, key)
    }
  })
  await changePackage(newJson)

  // publishing
  try {
    const { stdout } = await $`npm publish`
    console.log(stdout)
  } catch (e) {
    console.error(e)
  }

  // postpublish
  await changePackage(packageJson)
}
run()
