import { chromium } from 'playwright'
const URL = 'https://zrx-11.github.io/shanghai-chem-lab/'
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
const failed = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))
page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const subjects = await page.$$eval('nav.subject-nav button', (els) => els.map((e) => e.textContent.trim()))
const semesters = await page.$$eval('nav.semester-nav button', (els) => els.map((e) => e.textContent.trim()))
console.log('学科导航:', JSON.stringify(subjects))
console.log('学期数:', semesters.length, JSON.stringify(semesters))

let totalTopics = 0
for (let i = 0; i < semesters.length; i++) {
  await page.click(`nav.semester-nav button >> nth=${i}`)
  await page.waitForTimeout(120)
  const n = await page.$$eval('aside nav button', (els) => els.length)
  totalTopics += n
}
console.log('线上知识点总数:', totalTopics)

// 演示核验：高一下 温度影响；高二下 滴定/平衡；高三下 平衡
await page.click('nav.semester-nav button >> nth=1')
await page.waitForTimeout(120)
await page.$$eval('aside details', (els) => els.forEach((d) => { d.open = true }))
await page.locator('aside nav button:has-text("温度影响")').first().click()
await page.waitForTimeout(300)
console.log('温度影响 演示=', await page.$eval('.demo-panel', (e) => !!e && !!e.querySelector('svg,canvas')).catch(() => false))

await page.click('nav.semester-nav button >> nth=3')
await page.waitForTimeout(120)
await page.$$eval('aside details', (els) => els.forEach((d) => { d.open = true }))
await page.locator('aside nav button:has-text("酸碱中和滴定")').first().click()
await page.waitForTimeout(300)
console.log('中和滴定 演示=', await page.$eval('.demo-panel', (e) => !!e && !!e.querySelector('svg,canvas')).catch(() => false))

// 搜索纯度
await page.fill('input[type="search"]', '反应')
await page.waitForTimeout(300)
const results = await page.$$eval('.search-results li button', (els) => els.map((e) => e.textContent.trim()))
console.log('搜索结果数:', results.length, '非化学:', results.filter((r) => !r.includes('化学')).length)

await page.setViewportSize({ width: 390, height: 800 })
await page.waitForTimeout(300)
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
console.log('390px 横向溢出 px:', overflow)
console.log('console 错误:', errors.length, '请求失败:', failed.length)
errors.forEach((e) => console.log('  ERR:', e.slice(0, 180)))
failed.forEach((f) => console.log('  FAIL:', f.slice(0, 180)))
await browser.close()
