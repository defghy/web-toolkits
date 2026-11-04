import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
const baseUrl = process.env.KNOW_MAP_URL ?? 'http://127.0.0.1:5178/'
const artifacts = process.env.BROWSER_ARTIFACT_DIR ?? '/tmp/know-map-check'
await fs.mkdir(artifacts, { recursive: true })
let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
if (!executablePath) {
  const cache = path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell')
  const versions = await fs.readdir(cache).catch(() => [])
  if (versions.length)
    executablePath = path.join(cache, versions.sort().at(-1), 'chrome-headless-shell-linux64/chrome-headless-shell')
}
assert.ok(executablePath, '请设置 PUPPETEER_EXECUTABLE_PATH 指向本机 Chrome / Chromium 可执行文件')
const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] })
try {
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  const row = id => `[data-entry="${id}"] > .tree-row`
  async function clickRow(id, touch = false) {
    await page.$eval(row(id), element => element.scrollIntoView({ block: 'center' }))
    if (touch) await page.tap(row(id))
    else await page.click(row(id))
  }
  async function search(query, id) {
    const input = await page.$('input')
    await input.click()
    await input.type(query)
    await page.waitForSelector('[role="option"]')
    await input.press('Enter')
    await page.waitForSelector(`[data-entry="${id}"].selected`)
  }
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 })
  await page.goto(baseUrl, { waitUntil: 'networkidle0' })
  assert.equal(await page.$$eval('input', elements => elements.length), 1)
  const initialNodes = await page.$$eval('[role="treeitem"]', elements => elements.length)
  assert.equal(
    await page.$$eval('[role="treeitem"]', elements =>
      Math.max(...elements.map(element => Number(element.getAttribute('aria-level'))))
    ),
    2
  )
  assert.ok(
    await page.$$eval('[aria-level="1"]', elements =>
      elements.every(element => element.getAttribute('aria-expanded') === 'true')
    )
  )
  const initialHeight = await page.$eval('[role="tree"]', element => element.getBoundingClientRect().height)
  assert.ok(initialHeight <= initialNodes * 40 + 12, '节点应保持紧凑行高')
  assert.equal(await page.$('main svg.map-svg'), null)
  await clickRow('frontend')
  await page.waitForSelector(row('interface'), { hidden: true })
  await page.reload({ waitUntil: 'networkidle0' })
  assert.equal(await page.$(row('interface')), null, '刷新应恢复手动收起的状态')
  await clickRow('frontend')
  await page.waitForSelector(row('interface'))
  await clickRow('interface')
  await page.waitForSelector(row('platform'))
  assert.ok(await page.$(row('backend')), '展开分类时其他职责仍可见')
  await clickRow('frontend')
  assert.equal(await page.$(row('interface')), null)
  await page.focus('[data-entry="frontend"]')
  await page.keyboard.press('ArrowRight')
  await page.waitForSelector(row('interface'))
  await page.keyboard.press('ArrowRight')
  assert.equal(await page.evaluate(() => document.activeElement.dataset.entry), 'interface')
  await page.keyboard.press('ArrowLeft')
  assert.equal(await page.evaluate(() => document.activeElement.dataset.entry), 'frontend')
  await search('Vue', 'ui/vue')
  await page.waitForSelector('[data-entry="ui/vue"] .details')
  assert.ok(await page.$(row('infrastructure')))
  assert.equal(await page.$eval('[data-entry="ui/vue"]', element => element.getAttribute('aria-level')), '6')
  const selectedRect = await page.$eval('[data-entry="ui/vue"] > .tree-row', element => {
    const rect = element.getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom }
  })
  assert.ok(selectedRect.top >= 68 && selectedRect.bottom <= 1000, '搜索目标应滚动到可见区域')
  await page.screenshot({ path: path.join(artifacts, 'tree-desktop.png'), fullPage: true })
  await page.keyboard.press('Escape')
  assert.equal(await page.$('.details'), null)
  await search('Redis', 'cache/redis')
  await page.waitForSelector('.other-entry')
  await page.click('.other-entry')
  await page.waitForSelector('[data-entry="key-value/redis"].selected')
  const selectedUrl = page.url()
  await page.reload({ waitUntil: 'networkidle0' })
  assert.equal(page.url(), selectedUrl)
  await page.waitForSelector('[data-entry="key-value/redis"] .details')
  await clickRow('data')
  await page.waitForSelector(row('cache/redis'), { hidden: true })
  assert.equal(await page.$('.details'), null)
  await clickRow('data')
  const order = await page.$$eval('[role="treeitem"]', elements => elements.map(element => element.dataset.entry))
  assert.ok(order.indexOf('cache') < order.indexOf('persistence'))
  assert.ok(order.indexOf('persistence') < order.indexOf('other-data'))
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  await search('k8s', 'orchestration/kubernetes')
  await page.waitForSelector('[data-entry="orchestration/kubernetes"] .details')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await clickRow('orchestration/kubernetes', true)
  assert.equal(await page.$('.details'), null)
  await clickRow('orchestration/kubernetes', true)
  await page.waitForSelector('.details')
  await page.screenshot({ path: path.join(artifacts, 'tree-mobile.png'), fullPage: true })
  await page.goto(new URL('#focus=removed&selected=missing', baseUrl).href, { waitUntil: 'networkidle0' })
  assert.ok(await page.$('[role="tree"]'))
  assert.equal(await page.$('.selected'), null)
  const blocked = await context.newPage()
  blocked.on('pageerror', error => errors.push(String(error)))
  await blocked.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError')
      },
    })
  })
  await blocked.goto(new URL('#selected=ui/vue', baseUrl).href, { waitUntil: 'networkidle0' })
  await blocked.waitForSelector('[data-entry="ui/vue"] .details')
  assert.deepEqual(errors, [])
  const result = {
    date: new Date().toISOString(),
    browser: await browser.version(),
    machine: { platform: os.platform(), cpu: os.cpus()[0]?.model, node: process.version },
    initialNodes,
    initialHeight,
    checks: [
      '紧凑树形',
      '展开收起',
      '上下文保持',
      '键盘导航',
      '搜索展开祖先及滚动定位',
      '节点下方详情',
      '多入口跳转',
      'URL恢复',
      '数据顺序',
      '触屏',
      '无横向溢出',
      '无效ID',
      '禁用存储',
    ],
    errors,
  }
  await fs.writeFile(path.join(artifacts, 'result.json'), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
  await context.close()
} finally {
  await browser.close()
}
