import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 900 })

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'scripts/screenshot-home.png' })
console.log('Home screenshot saved')

// Test task 1: fitness in NW (using separate query + filter)
await page.fill('#search-input', 'fitness')
await page.selectOption('#filter-quadrant', 'NW')
await page.waitForTimeout(400)
await page.screenshot({ path: 'scripts/screenshot-search.png' })
console.log('Search screenshot saved')

// Click first result for detail view
const firstCard = page.locator('.program-card').first()
const count = await page.locator('.program-card').count()
console.log('Cards visible:', count)
if (count > 0) {
  await firstCard.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'scripts/screenshot-detail.png' })
  console.log('Detail screenshot saved')
}

await browser.close()
