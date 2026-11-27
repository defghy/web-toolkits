import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

const usbipd = '/mnt/c/Program Files/usbipd-win/usbipd.exe'
const androidSdk = process.env.ANDROID_HOME || join(homedir(), 'Android', 'Sdk')
const adb = join(androidSdk, 'platform-tools', 'adb')
const phoneUsbPrefix = 'USB\\VID_339B&PID_107D\\'

function run(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 15_000,
  })
}

function readUsbDevices() {
  return JSON.parse(run(usbipd, ['state'])).Devices
}

async function connectDevice() {
  if (!existsSync(usbipd)) {
    throw new Error('找不到 usbipd-win。请在 WSL 的 Ubuntu 终端运行此命令。')
  }
  if (!existsSync(adb)) {
    throw new Error(`找不到 adb。请检查 ANDROID_HOME（当前 SDK 目录为 ${androidSdk}）。`)
  }

  const phones = readUsbDevices().filter(
    ({ BusId, InstanceId }) => BusId && InstanceId.toUpperCase().startsWith(phoneUsbPrefix),
  )

  if (phones.length === 0) {
    throw new Error('没有发现 HONOR 500 Pro。请用数据线连接手机并开启 USB 调试。')
  }
  if (phones.length > 1) {
    throw new Error('检测到多台匹配的手机。请只保留要调试的那一台。')
  }

  const [{ InstanceId: instanceId }] = phones
  const serial = instanceId.split('\\').at(-1)
  const deadline = Date.now() + 20_000
  let phone = phones[0]
  let attachAttempts = 0
  let attachError
  let adbStatus

  while (Date.now() < deadline) {
    const busId = phone?.BusId
    if (busId && !phone.ClientIPAddress && attachAttempts < 3) {
      if (!phone.PersistedGuid) {
        throw new Error(`手机尚未共享。请在管理员 PowerShell 执行 usbipd bind --busid ${busId}，然后重试。`)
      }

      attachAttempts++
      console.log(`正在将手机接入 WSL（USB ${busId}，第 ${attachAttempts} 次）…`)
      try {
        run(usbipd, ['attach', '--wsl', '--busid', busId])
        attachError = undefined
      } catch (error) {
        attachError = error
      }
    }

    const device = run(adb, ['devices'])
      .split(/\r?\n/)
      .find((line) => line.split(/\s+/, 1)[0] === serial)
    adbStatus = device?.slice(serial.length).trim()

    if (adbStatus === 'device' && busId) {
      console.log(`HONOR 500 Pro（USB ${busId}）已接入 WSL，ADB 状态为 device。`)
      return
    }
    if (adbStatus === 'unauthorized') {
      throw new Error('请解锁手机，点「允许 USB 调试」，然后重新执行 pnpm connDevice。')
    }

    await setTimeout(1000)
    phone = readUsbDevices().find((device) => device.InstanceId === instanceId)
  }

  if (!phone?.BusId) {
    throw new Error('等待期间手机已断开 USB。请重新插入数据线后再试。')
  }
  if (!phone.ClientIPAddress) {
    throw attachError || new Error('手机已共享，但未能保持接入 WSL。请重新插入数据线后再试。')
  }
  if (adbStatus?.startsWith('no permissions')) {
    throw new Error('WSL 已看到手机，但 adb 缺少 USB 访问权限。请检查 udev 规则。')
  }

  throw new Error('手机已接入 WSL，但 adb 尚未连接。请解锁手机，确认「USB 调试」已开启。')
}

try {
  await connectDevice()
} catch (error) {
  console.error(error.stderr?.trim() || error.message)
  process.exitCode = 1
}
