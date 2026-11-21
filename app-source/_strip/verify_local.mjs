import { chromium } from 'playwright'

const BASE = 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

const subjects = await page.$$eval('nav.subject-nav button', (els) => els.map((e) => e.textContent.trim()))
const semesters = await page.$$eval('nav.semester-nav button', (els) => els.map((e) => e.textContent.trim()))
console.log('学科导航:', JSON.stringify(subjects))
console.log('学期导航:', JSON.stringify(semesters))

// 遍历六个学期，统计目录知识点数与互动演示标记
for (let i = 0; i < semesters.length; i++) {
  await page.click(`nav.semester-nav button >> nth=${i}`)
  await page.waitForTimeout(150)
  const topicCount = await page.$$eval('aside nav button', (els) => els.length)
  const demoCount = await page.$$eval('aside nav button small:has-text("互动")', (els) => els.length)
  const breadcrumb = await page.$eval('.content-breadcrumb', (e) => e.textContent.trim())
  console.log(`学期[${semesters[i]}] 知识点=${topicCount} 互动=${demoCount} 面包屑=${breadcrumb}`)
}

// 回到有互动演示的学期（高一下），展开所有单元，找第一个互动演示并打开
await page.click('nav.semester-nav button >> nth=1')
await page.waitForTimeout(150)
await page.$$eval('aside details', (els) => els.forEach((d) => { d.open = true }))
const demoBtn = page.locator('aside nav button:has-text("互动")').first()
const demoLabel = await demoBtn.textContent()
await demoBtn.click()
await page.waitForTimeout(400)
const demoSvg = await page.$eval('.demo-panel svg, .demo-panel canvas', (e) => e ? 'rendered' : 'missing').catch(() => 'missing')
const eyebrow = await page.$eval('.topic-heading .eyebrow', (e) => e.textContent.trim())
console.log('首个互动:', demoLabel.trim(), '| 演示区:', demoSvg, '| 眉题:', eyebrow)

// 三个化学演示 id 是否能在数据中命中：遍历目录点含滴定/平衡/速率
for (const sw of [1, 3, 3]) {
  await page.click(`nav.semester-nav button >> nth=${sw}`)
  await page.waitForTimeout(150)
  await page.$$eval('aside details', (els) => els.forEach((d) => { d.open = true }))
  for (const kw of ['滴定', '平衡', '速率']) {
    const btn = page.locator(`aside nav button:has-text("${kw}")`).first()
    if (await btn.count()) {
      await btn.click()
      await page.waitForTimeout(300)
      const hasDemo = await page.$eval('.demo-panel', (e) => !!e && (e.querySelector('svg,canvas') !== null)).catch(() => false)
      const title = await page.$eval('.topic-heading h1, .topic-heading strong', (e) => e?.textContent?.trim() ?? '').catch(() => '')
      console.log(`学期${sw} 关键词「${kw}」标题=${title} 演示渲染=${hasDemo}`)
    }
  }
}

// 搜索：输入化学词，收集结果文本
await page.fill('input[type="search"]', '反应')
await page.waitForTimeout(300)
const results = await page.$$eval('.search-results li button', (els) => els.map((e) => e.textContent.trim()).slice(0, 10))
const summary = await page.$eval('.search-summary', (e) => e.textContent.trim()).catch(() => '')
console.log('搜索「反应」摘要:', summary)
console.log('搜索「反应」结果:', JSON.stringify(results))
const nonChem = results.filter((r) => !r.includes('化学'))
console.log('非化学结果数:', nonChem.length)

// 移动端横向溢出检查
await page.setViewportSize({ width: 390, height: 800 })
await page.waitForTimeout(300)
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
console.log('390px 横向溢出 px:', overflow)

console.log('console/page 错误数:', errors.length)
errors.forEach((e) => console.log('  ERR:', e.slice(0, 200)))
await browser.close()
