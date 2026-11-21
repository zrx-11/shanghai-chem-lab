import { chromium } from 'playwright'
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })

const targets = ['化学平衡移动', '化学平衡移动与常数', '浓度压强对平衡的影响', '酸碱中和滴定', '浓度温度与反应速率', '温度影响']
const semCount = await page.$$eval('nav.semester-nav button', (e) => e.length)
for (let i = 0; i < semCount; i++) {
  await page.click(`nav.semester-nav button >> nth=${i}`)
  await page.waitForTimeout(120)
  await page.$$eval('aside details', (els) => els.forEach((d) => { d.open = true }))
  for (const t of targets) {
    const btn = page.locator(`aside nav button:has-text("${t}")`).first()
    if (await btn.count()) {
      await btn.click()
      await page.waitForTimeout(250)
      const demo = await page.$eval('.demo-panel', (e) => !!e && !!e.querySelector('svg,canvas')).catch(() => false)
      const eyebrow = await page.$eval('.topic-heading .eyebrow', (e) => e.textContent.trim()).catch(() => '')
      console.log(`学期${i} 「${t}」 演示=${demo} ${eyebrow}`)
    }
  }
}
console.log('pageerror:', errors.length)
await browser.close()
