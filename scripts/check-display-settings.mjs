// Display-settings stress check (V5 usability feedback, 2026-11-10).
//
// Two round-5 participants had phones set to large or bold system text:
// on Android the text burst out of buttons and off the sides of the screen,
// and on an iPhone the guided tour lost its "Show me around" button. This
// script loads the site the way those phones see it and reports anything
// that would break for them.
//
// How the phone settings are emulated:
//   - iPhone Display Zoom, Safari page zoom (aA), and recent Chrome on
//     Android following the system font size all zoom the whole page. To a
//     web page that looks like a narrower, shorter screen with the same CSS
//     pixel sizes, so those profiles use a smaller viewport.
//   - Older Android Chrome, Samsung Internet and in-app browsers scale text
//     only, leaving the layout alone. Those profiles multiply the root font
//     size on top of the app's own Text & Display setting.
//
// For each profile it checks the landing page, the directory, and every
// guided-tour step:
//   - text that spills outside a button, link, chip or label
//   - anything that runs past the left or right edge of the screen
//   - a tour card whose main button is off screen and can't be scrolled to
//
// Usage: npm run dev, then  npm run check:display
// (CHECK_BASE_URL overrides http://127.0.0.1:5173.) Screenshots of every
// failure go to output/display-check/. Exits non-zero if anything fails.

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from 'playwright'

const baseUrl = process.env.CHECK_BASE_URL || 'http://127.0.0.1:5173'
const outputDir = path.join(process.cwd(), 'output', 'display-check')

// sizeIndex is the app's own Text & Display setting (0 Small … 3 Maximum).
// textScale multiplies the root font size, like a text-only system setting.
const PROFILES = [
  { name: 'iphone-default', engine: webkit, viewport: { width: 390, height: 844 }, sizeIndex: 1, textScale: 1 },
  // iPhone Display Zoom "Larger Text": the phone reports a 320px-wide screen.
  { name: 'iphone-display-zoom', engine: webkit, viewport: { width: 320, height: 693 }, sizeIndex: 1, textScale: 1 },
  // Safari aA at 150% on a 390x844 phone, with Safari's bars showing.
  { name: 'iphone-safari-150', engine: webkit, viewport: { width: 260, height: 480 }, sizeIndex: 1, textScale: 1 },
  // Chrome on Android following a large system font (page zoom ~150%).
  { name: 'android-page-zoom-150', engine: chromium, viewport: { width: 274, height: 520 }, sizeIndex: 1, textScale: 1 },
  // Text-only scaling at the system maximum, even with the app on Small.
  { name: 'android-text-200-small', engine: chromium, viewport: { width: 360, height: 640 }, sizeIndex: 0, textScale: 2 },
  { name: 'android-text-150-max', engine: chromium, viewport: { width: 360, height: 640 }, sizeIndex: 3, textScale: 1.5 },
]

// The landing page is home; the directory is one press of Browse away.
const PAGES = [
  { name: 'landing' },
  { name: 'directory', open: async (page) => page.click('.landing-browse-btn') },
]

// Text-only scaling the way Android Chrome does it: its Accessibility →
// Text scaling setting drives text-size-adjust, which multiplies every font
// size (px and rem alike) without touching the layout. Chromium honours it
// under mobile emulation.
function textScaleScript(scale) {
  return `(() => {
    if (${scale} === 1) return;
    const css = 'html { text-size-adjust: ${scale * 100}% !important; -webkit-text-size-adjust: ${scale * 100}% !important; }';
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  })()`
}

// Runs in the page: every visible control whose text spills out of it, and
// every element that pokes past either side of the screen.
function findOverflow() {
  const vw = document.documentElement.clientWidth
  const describe = (el) => {
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''
    const text = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)
    return `${el.tagName.toLowerCase()}${cls} "${text}"`
  }
  const visible = (el) => {
    const s = getComputedStyle(el)
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false
    if (el.closest('[aria-hidden="true"], .sr-only, .visually-hidden')) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }
  const issues = []
  const controls = document.querySelectorAll('button, a, label, select, input, [role="button"], .chip, .badge')
  for (const el of controls) {
    if (!visible(el)) continue
    const s = getComputedStyle(el)
    // Single-line inputs scroll their own text; that's expected.
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') continue
    // Intentional truncation with an ellipsis is fine.
    if (s.textOverflow === 'ellipsis') continue
    const overX = el.scrollWidth - el.clientWidth
    const overY = el.scrollHeight - el.clientHeight
    if (overX > 2 || overY > 2) {
      issues.push(`text spills out of ${describe(el)} by ${Math.max(overX, overY)}px`)
    }
  }
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue
    if (el.closest('.tour-root, .filter-drawer:not(.open), [inert]')) continue
    const s = getComputedStyle(el)
    if (s.position === 'fixed' && el.getBoundingClientRect().right > vw + 600) continue // off-canvas drawers
    // Only leaf-ish elements, so one wide parent doesn't list every child.
    if (el.children.length > 0 && el.innerText?.trim() === '') continue
    const r = el.getBoundingClientRect()
    if (r.right > vw + 1 || r.left < -1) {
      let p = el.parentElement
      let clipped = false
      while (p && p !== document.body) {
        const ps = getComputedStyle(p)
        if (/(auto|scroll)/.test(ps.overflowX)) { clipped = true; break }
        p = p.parentElement
      }
      if (!clipped && el.children.length === 0) {
        issues.push(`runs off the ${r.left < -1 ? 'left' : 'right'} edge: ${describe(el)} (${Math.round(r.left)}–${Math.round(r.right)} of ${vw}px)`)
      }
    }
  }
  return [...new Set(issues)]
}

// Runs in the page: is the tour card's main button reachable?
function checkTourCard() {
  const card = document.querySelector('.tour-card--shown')
  if (!card) return { ok: false, issue: 'tour card not shown' }
  const btn = card.querySelector('.tour-btn--primary')
  const vh = window.innerHeight
  const vw = window.innerWidth
  const c = card.getBoundingClientRect()
  const b = btn.getBoundingClientRect()
  const title = card.querySelector('.tour-title')?.innerText
  const issues = []
  if (c.top < -1 || c.bottom > vh + 1) issues.push(`card is ${Math.round(c.height)}px tall at top ${Math.round(c.top)}px but the screen is ${vh}px`)
  if (c.left < -1 || c.right > vw + 1) issues.push(`card runs off the side (${Math.round(c.left)}–${Math.round(c.right)} of ${vw}px)`)
  if (b.top < 0 || b.bottom > vh) issues.push(`"${btn.innerText}" button is off screen (top ${Math.round(b.top)}px, screen ${vh}px)`)
  for (const el of card.querySelectorAll('.tour-btn')) {
    if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) issues.push(`text spills out of the "${el.innerText}" button`)
  }
  return { ok: issues.length === 0, issue: issues.join('; '), title, label: btn.innerText }
}

async function run() {
  await mkdir(outputDir, { recursive: true })
  let failures = 0
  const browsers = new Map()

  for (const profile of PROFILES) {
    if (!browsers.has(profile.engine)) browsers.set(profile.engine, await profile.engine.launch())
    const browser = browsers.get(profile.engine)
    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: profile.engine === chromium,
      reducedMotion: 'reduce',
    })
    await context.addInitScript(({ sizeIndex }) => {
      localStorage.setItem('csrg-accessibility', JSON.stringify({ sizeIndex, contrast: 'normal' }))
      localStorage.setItem('csrg-tour-seen', '1')
    }, { sizeIndex: profile.sizeIndex })
    await context.addInitScript(textScaleScript(profile.textScale))
    const page = await context.newPage()
    console.log(`\n■ ${profile.name}  (${profile.viewport.width}×${profile.viewport.height}, text ${profile.textScale}×, app size ${profile.sizeIndex})`)

    for (const target of PAGES) {
      await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
      if (target.open) await target.open(page)
      await page.waitForTimeout(400)
      const issues = await page.evaluate(findOverflow)
      if (issues.length) {
        failures += issues.length
        const shot = path.join(outputDir, `${profile.name}-${target.name}.png`)
        await page.screenshot({ path: shot, fullPage: true })
        console.log(`  ✗ ${target.name}: ${issues.length} problem(s) — ${path.relative(process.cwd(), shot)}`)
        for (const i of issues.slice(0, 12)) console.log(`      ${i}`)
        if (issues.length > 12) console.log(`      …and ${issues.length - 12} more`)
      } else {
        console.log(`  ✓ ${target.name}`)
      }
    }

    // Guided tour: walk every step and check the card each time.
    await page.goto(baseUrl + '/?tour', { waitUntil: 'networkidle' })
    for (let step = 0; step < 12; step++) {
      await page.waitForSelector('.tour-card--shown', { timeout: 4000 }).catch(() => {})
      await page.waitForTimeout(200)
      const result = await page.evaluate(checkTourCard)
      const label = `tour step ${step + 1} "${result.title ?? '?'}"`
      if (!result.ok) {
        failures++
        const shot = path.join(outputDir, `${profile.name}-tour-${step + 1}.png`)
        await page.screenshot({ path: shot })
        console.log(`  ✗ ${label}: ${result.issue} — ${path.relative(process.cwd(), shot)}`)
      } else {
        console.log(`  ✓ ${label}`)
      }
      if (result.label === 'Finish' || !result.label) break
      // Click the way a person would: if the button isn't reachable, the
      // tour is stuck for them, so stop here.
      const btn = page.locator('.tour-card--shown .tour-btn--primary')
      try {
        await btn.scrollIntoViewIfNeeded({ timeout: 1000 })
        await btn.click({ timeout: 1500 })
      } catch {
        console.log(`  ✗ tour stuck: couldn't press "${result.label}"`)
        failures++
        break
      }
    }
    await context.close()
  }

  for (const b of browsers.values()) await b.close()
  console.log(failures ? `\n${failures} problem(s) found.` : '\nAll display-settings checks passed.')
  process.exit(failures ? 1 : 0)
}

run().catch((err) => { console.error(err); process.exit(1) })
