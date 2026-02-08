import { promises as fsp } from 'fs'
import path from 'path'
import { $ } from 'execa'

import packageJson from '../package.json' with { type: 'json' };

// 解析命令行参数
const parseArgs = () => {
  const args = process.argv.slice(2)
  const options = {}
  args.forEach(arg => {
    if (arg.startsWith('--otp=')) {
      options.otp = arg.replace('--otp=', '')
    }
  })
  return options
}

const cliOptions = parseArgs()

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
    const publishArgs = ['publish']
    if (cliOptions.otp) {
      publishArgs.push('--otp', cliOptions.otp)
    }
    const { stdout } = await $`npm ${publishArgs}`
    console.log(stdout)
  } catch (e) {
    console.error(e)
  }

  // postpublish
  await changePackage(packageJson)
}
run()
