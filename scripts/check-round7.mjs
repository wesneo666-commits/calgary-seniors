// Round 7 feedback check (2026-11-26). Confirms each item on the list:
//   1. Landing page: Joel's numbered filter cards, search above them, order
//      Service type / Location / Cost / Format, the directory's service type
//      dropdown, and GO! carrying the choices into the directory.
//   2. Service type dropdown: typing a keyword ("Education") finds
//      "Learning & education", on the landing page and in the directory.
//   3. Guided tour: the first step after the welcome is Text & Display, and
//      on phones the tour still includes Text & Display and How to use this.
//      How-to guide on phones: the phone number scrolls with the guide.
//   4. About page: the button reads "← Back".
//   5. "Take the guided tour" works when the guide is opened on the About page.
//
// Usage: npm run dev, then  node scripts/check-round7.mjs
// (CHECK_BASE_URL overrides http://127.0.0.1:5173.) Exits non-zero on failure.

import { chromium, webkit } from 'playwright'

const baseUrl = process.env.CHECK_BASE_URL || 'http://127.0.0.1:5173'

const SIZES = [
  { name: 'desktop 1440', engine: chromium, viewport: { width: 1440, height: 900 }, phone: false },
  { name: 'tablet 800', engine: chromium, viewport: { width: 800, height: 1024 }, phone: false },
  { name: 'phone 375 (Chrome)', engine: chromium, viewport: { width: 375, height: 740 }, phone: true },
  { name: 'phone 390 (Safari)', engine: webkit, viewport: { width: 390, height: 844 }, phone: true },
]

let failures = 0
function check(label, ok, detail = '') {
  if (!ok) failures++
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

async function freshPage(browser, size) {
  const context = await browser.newContext({ viewport: size.viewport, hasTouch: size.phone, isMobile: size.phone && size.engine === chromium })
  // Skip the first-visit tour so it doesn't cover the page.
  await context.addInitScript(() => {
    try {
      for (const k of Object.keys(localStorage)) if (/tour/i.test(k)) localStorage.setItem(k, '1')
      localStorage.setItem('csrg-tour-seen', '1')
    } catch { /* ignore */ }
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  return { context, page, errors }
}

async function closeTourIfOpen(page) {
  const close = page.locator('.tour-close')
  if (await close.count()) await close.first().click()
}

async function serviceSearch(page, scope, word) {
  await page.locator(`${scope} .service-select-trigger`).click()
  const input = page.locator(`${scope} .service-select-search-input`)
  await input.fill(word)
  return page.locator(`${scope} .service-select-list .service-select-option`).allTextContents()
}

async function runSize(size) {
  console.log(`\n${size.name}`)
  const browser = await size.engine.launch()
  const { context, page, errors } = await freshPage(browser, size)

  // ── 1. Landing page ──────────────────────────────────────────
  await page.goto(`${baseUrl}/`)
  await closeTourIfOpen(page)
  const searchTop = (await page.locator('.landing-search').boundingBox())?.y ?? Infinity
  const filtersTop = (await page.locator('.landing-filters').boundingBox())?.y ?? -1
  check('Search bar sits above the filters', searchTop < filtersTop)

  const questions = await page.locator('.landing-card-question').allTextContents()
  check('Four numbered cards in order Service type, Location, Cost, Format',
    JSON.stringify(questions) === JSON.stringify(['What kind of service?', 'Which part of Calgary?', 'Free or paid?', 'How would you like to take part?']),
    questions.join(' | '))
  const nums = await page.locator('.landing-card-num').allTextContents()
  check('Cards numbered 1–4', nums.join('') === '1234', nums.join(','))
  check('Card 1 uses the directory\'s service type dropdown',
    await page.locator('.landing-card').first().locator('.service-select-trigger').count() === 1)
  check('GO! button present', await page.locator('.landing-go-btn', { hasText: 'GO!' }).isVisible())
  check('"Or Browse Full Directory" button', await page.locator('.landing-browse-btn', { hasText: 'Or Browse Full Directory' }).isVisible())

  // Layout per screen size
  const cardBoxes = await page.locator('.landing-card').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top))
  const rows = new Set(cardBoxes.map((t) => Math.round(t))).size
  const expectedRows = size.viewport.width > 1100 ? 1 : size.viewport.width > 560 ? 2 : 4
  check(`Cards laid out in ${expectedRows} row(s)`, rows === expectedRows, `got ${rows}`)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  check('No sideways scrolling on the landing page', overflow <= 0, `${overflow}px wider than screen`)

  // ── 2. Keyword search in the landing dropdown ────────────────
  const landingOptions = await serviceSearch(page, '.landing-card', 'Education')
  check('Landing: "Education" finds "Learning & education"', landingOptions.some((t) => t.includes('Learning & education')), landingOptions.join(' | '))
  check('Landing: unrelated types are hidden', !landingOptions.some((t) => t.includes('Transportation')))
  await page.locator('.landing-card .service-select-search-input').fill('zzzz')
  check('Landing: no-match message shown', await page.locator('.service-select-empty').isVisible())
  await page.locator('.landing-card .service-select-search-input').fill('education')
  await page.locator('.landing-card .service-select-item', { hasText: 'Learning & education' }).click()
  await page.keyboard.press('Escape')
  await page.locator('.landing-chip', { hasText: /^Free$/ }).click()
  const count = await page.locator('.landing-go-count').textContent()
  check('Match count updates after choosing', /\d+ services? match/.test(count ?? ''), count)

  // GO! applies the choices in the directory
  await page.locator('.landing-go-btn').click()
  await page.waitForSelector('.results-list, .main-layout')
  const dirLabel = await page.locator('.service-select-current').first().textContent()
  check('GO!: directory shows Learning & education', (dirLabel ?? '').includes('Learning & education'), dirLabel)
  const freeOn = await page.locator('[aria-pressed="true"]', { hasText: 'Free' }).count()
  check('GO!: directory has Free selected', freeOn > 0)

  // ── 2b. Keyword search in the directory dropdown ─────────────
  if (size.phone) {
    await page.locator('.mobile-filter-btn').click()
  }
  const scope = size.phone ? '.filter-panel' : '.filter-aside .filter-panel'
  const dirOptions = await serviceSearch(page, scope, 'education')
  check('Directory: "education" finds "Learning & education"', dirOptions.some((t) => t.includes('Learning & education')), dirOptions.join(' | '))
  await context.close()

  // ── 3. Guided tour: first step is Text & Display ─────────────
  const tour = await freshPage(browser, size)
  await tour.page.goto(`${baseUrl}/`)
  await closeTourIfOpen(tour.page)
  if (size.phone) {
    await tour.page.locator('.site-menu-btn').click()
    await tour.page.locator('.site-menu-item', { hasText: 'How to use this' }).click()
  } else {
    await tour.page.locator('.help-btn').click()
  }

  // ── 3b. How-to guide on phones: phone number scrolls ─────────
  if (size.phone) {
    const footer = await tour.page.locator('.help-footer').boundingBox()
    const vh = size.viewport.height
    check('Phone: guide opens without the phone number pinned on screen', footer && footer.y >= vh, `footer top ${Math.round(footer?.y)} / screen ${vh}`)
    await tour.page.locator('.help-drawer').evaluate((d) => { d.scrollTop = d.scrollHeight })
    const footerAfter = await tour.page.locator('.help-footer').boundingBox()
    check('Phone: phone number reachable at the bottom of the guide', footerAfter && footerAfter.y < vh, `footer top ${Math.round(footerAfter?.y)}`)
    check('Phone: "← Back" stays at the top while scrolled',
      Math.round((await tour.page.locator('.help-header').boundingBox())?.y ?? 99) === 0)
    await tour.page.locator('.help-drawer').evaluate((d) => { d.scrollTop = 0 })
  }

  await tour.page.locator('.help-tour-btn').click()
  await tour.page.locator('.tour-btn--primary', { hasText: 'Show me around' }).click()
  await tour.page.waitForTimeout(1500)
  const first = await tour.page.locator('.tour-title').textContent()
  const progress = await tour.page.locator('.tour-progress').textContent()
  const firstBody = await tour.page.locator('.tour-body').textContent()
  if (size.phone) check('Phone tour: Text & Display step points at Menu', /Tap Menu, then Text & Display/.test(firstBody ?? ''), firstBody)
  check('Tour step 1 is Text & Display', first === 'Make the text easier to read' && /Step 1 of/.test(progress ?? ''), `${progress} — ${first}`)

  // Walk the rest of the tour and collect titles
  const titles = [first]
  for (let i = 0; i < 12; i++) {
    const btn = tour.page.locator('.tour-btn--primary')
    if ((await btn.textContent())?.includes('Finish')) break
    await btn.click()
    await tour.page.waitForTimeout(1300)
    titles.push(await tour.page.locator('.tour-title').textContent())
  }
  check('Tour includes How to use this ("Help is always here")', titles.includes('Help is always here'), titles.join(' → '))
  check('Text & Display appears only once in the tour', titles.filter((t) => t === 'Make the text easier to read').length === 1)
  await tour.context.close()

  // ── 4. About page button ─────────────────────────────────────
  const about = await freshPage(browser, size)
  await about.page.goto(`${baseUrl}/?view=about`)
  await closeTourIfOpen(about.page)
  const backTexts = (await about.page.locator('.about-back-btn').allTextContents()).map((t) => t.trim())
  check('About page buttons (top and bottom) read "← Back"', backTexts.length === 2 && backTexts.every((t) => t === '← Back'), backTexts.join(' | '))
  check('No "Back to directory" text left on the About page', !(await about.page.locator('body').textContent()).match(/back to (the )?directory/i))
  await about.context.close()

  // ── 5. Tour starts from the About page's guide (2026-11-27) ──
  const fromAbout = await freshPage(browser, size)
  await fromAbout.page.goto(`${baseUrl}/?view=about`)
  await closeTourIfOpen(fromAbout.page)
  if (size.phone) {
    await fromAbout.page.locator('.site-menu-btn').click()
    await fromAbout.page.locator('.site-menu-item', { hasText: 'How to use this' }).click()
  } else {
    await fromAbout.page.locator('.help-btn').click()
  }
  await fromAbout.page.locator('.help-tour-btn').click()
  const tourCard = fromAbout.page.locator('.tour-card')
  await tourCard.waitFor({ timeout: 3000 }).catch(() => {})
  check('About page: "Take the guided tour" opens the tour', await tourCard.isVisible())
  check('About page: tour runs on the home page', await fromAbout.page.locator('.wizard-landing').isVisible())
  await fromAbout.page.locator('.tour-btn--primary', { hasText: 'Show me around' }).click()
  await fromAbout.page.waitForTimeout(1500)
  check('About page: tour step 1 is Text & Display', (await fromAbout.page.locator('.tour-title').textContent()) === 'Make the text easier to read')
  await fromAbout.page.keyboard.press('Escape')
  await fromAbout.page.goBack()
  await fromAbout.page.waitForTimeout(400)
  check('About page: Back returns to the About page', await fromAbout.page.locator('.about-page').isVisible())
  await fromAbout.context.close()

  const allErrors = [...errors, ...tour.errors, ...about.errors, ...fromAbout.errors]
  check('No console errors', allErrors.length === 0, allErrors.slice(0, 3).join(' / '))
  await browser.close()
}

for (const size of SIZES) {
  try {
    await runSize(size)
  } catch (e) {
    failures++
    console.log(`  FAIL  ${size.name} crashed — ${e.message.split('\n')[0]}`)
  }
}

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.')
process.exit(failures ? 1 : 0)
