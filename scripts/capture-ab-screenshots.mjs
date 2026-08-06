import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import programs from '../src/data/programs.json' with { type: 'json' }
import { QUADRANTS, SERVICE_AREA_GROUPS } from '../src/utils/constants.js'

const baseUrl = process.env.AB_BASE_URL || 'http://127.0.0.1:5173'
const outputDir = path.join(process.cwd(), 'output', 'ab-test')
const outputFolders = {
  'card-preview': '01-program-card-preview',
  'program-detail': '02-program-card-view',
  'service-type-filter': '03-service-type-filter',
  'location-filter': '04-location-filter',
}

function artifactPath(slug, filename) {
  return path.join(outputDir, outputFolders[slug], filename)
}

const profiles = [
  { name: 'desktop', viewport: { width: 1280, height: 900 }, widths: { card: 820, detail: 900, filter: 480 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, widths: { card: 358, detail: 358, filter: 358 } },
]

const comparisons = [
  {
    slug: 'card-preview',
    title: 'Program card preview',
    aLabel: 'Without description preview',
    bLabel: 'With description preview',
  },
  {
    slug: 'program-detail',
    title: 'Program card view',
    aLabel: 'Contact information at the top',
    bLabel: 'Contact information at the bottom',
  },
  {
    slug: 'service-type-filter',
    title: 'Service type filter',
    aLabel: 'Checkboxes with higher-order categories only',
    bLabel: 'Drop-down menu with all service types',
  },
  {
    slug: 'location-filter',
    title: 'Location filter',
    aLabel: 'Location checkboxes',
    bLabel: 'Location drop-down menu',
  },
]

const contextComparisons = comparisons.filter(({ slug }) => slug !== 'program-detail')

const descriptionByProgram = Object.fromEntries(
  programs.map((program) => [
    `${program.programName}\n${program.organization}`,
    program.description,
  ])
)

const captureStyles = `
  body.ab-capture-body {
    margin: 0;
    padding: 0;
    background: var(--color-bg);
    overflow: visible;
  }
  #ab-stage {
    box-sizing: border-box;
    padding: 24px;
    background: var(--color-bg);
    color: var(--color-text);
  }
  .ab-caption {
    margin: 0 0 18px;
    padding: 12px 16px;
    background: var(--petal-slate-deep);
    color: var(--color-text-inverse);
    border-radius: var(--radius-md);
    font-size: var(--font-size-lg);
    font-weight: 700;
    line-height: 1.3;
  }
  #ab-stage .results-list {
    grid-template-columns: 1fr;
  }
  #ab-stage .results-list > li > article {
    background: var(--color-surface);
  }
  .ab-card-description {
    margin-top: var(--space-sm);
    color: var(--color-text);
    font-size: var(--font-size-sm);
    line-height: 1.45;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-align: left;
  }
  #ab-stage.ab-detail-stage .detail-panel {
    width: 100%;
    max-height: none;
    overflow: visible;
    box-shadow: none;
  }
  #ab-stage.ab-filter-stage .filter-group {
    margin: 0;
    background: var(--color-surface);
  }
  #ab-stage.ab-filter-stage .service-select-list {
    position: static;
    margin-top: 4px;
    max-height: 352px;
    box-shadow: none;
  }
  .ab-checkbox-list {
    display: grid;
    gap: var(--space-xs);
  }
  .ab-checkbox-choice {
    display: flex !important;
    align-items: center;
    gap: var(--space-sm);
    min-height: var(--touch-target);
    margin: 0 !important;
    padding: var(--space-xs) var(--space-sm);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-sm) !important;
    font-weight: 500 !important;
    line-height: 1.25;
  }
  .ab-checkbox-choice input {
    width: 22px;
    height: 22px;
    margin: 0;
    flex: 0 0 22px;
    accent-color: var(--petal-slate-ink);
  }
  .ab-scroll-cue {
    margin: var(--space-xs) 0 0;
    color: var(--petal-slate-ink);
    font-size: var(--font-size-sm);
    font-weight: 700;
    text-align: center;
  }
  @media (max-width: 560px) {
    #ab-stage { padding: 16px; }
    .ab-caption { font-size: var(--font-size-base); }
    #ab-stage.ab-detail-stage .detail-top-bar {
      align-items: flex-start;
    }
  }
`

await Promise.all(
  Object.values(outputFolders).map((folder) =>
    mkdir(path.join(outputDir, folder), { recursive: true })
  )
)

const browser = await chromium.launch({ headless: true })

async function openPage(profile) {
  const context = await browser.newContext({ viewport: profile.viewport })
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.setItem('csrg-accessibility', JSON.stringify({
      sizeIndex: 1,
      contrast: 'normal',
      fontKey: 'standard',
      spacing: 'normal',
    }))
  })
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: captureStyles })
  await page.evaluate(() => {
    window.__showAbStage = (node, caption, kind, width) => {
      const stage = document.createElement('main')
      stage.id = 'ab-stage'
      stage.className = `ab-${kind}-stage`
      stage.style.width = `${width}px`

      const heading = document.createElement('h1')
      heading.className = 'ab-caption'
      heading.textContent = caption
      stage.append(heading, node)

      document.body.className = 'ab-capture-body'
      document.body.replaceChildren(stage)
    }
  })
  return { context, page }
}

async function enterDirectSearch(page) {
  const directSearchButton = page.getByRole('button', { name: 'Direct Search', exact: true })
  if (await directSearchButton.count()) {
    await directSearchButton.click()
  }
  await page.locator('.results-list').waitFor()
}

async function saveStage(page, slug, filename) {
  await page.locator('#ab-stage').screenshot({
    path: artifactPath(slug, filename),
    animations: 'disabled',
  })
}

async function saveContext(page, slug, filename, scrollTop = 0) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  })
  await page.evaluate((top) => window.scrollTo(0, top), scrollTop)
  await page.waitForFunction((top) => Math.abs(window.scrollY - top) < 1, scrollTop)
  await page.screenshot({
    path: artifactPath(slug, filename),
    animations: 'disabled',
  })
}

async function captureCardPreview(profile, withDescription) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    await page.getByRole('searchbox').fill('transportation')
    await page.locator('.program-card').first().waitFor()

    await page.evaluate(({ descriptions, caption, width, withDescription }) => {
      const list = document.querySelector('.results-list').cloneNode(true)
      ;[...list.children].slice(3).forEach((item) => item.remove())

      if (withDescription) {
        list.querySelectorAll('.program-card').forEach((card) => {
          const name = card.querySelector('.card-name')?.textContent.trim() || ''
          const organization = card.querySelector('.card-org')?.textContent.trim() || name
          const description = descriptions[`${name}\n${organization}`]
          if (!description) return
          const preview = document.createElement('p')
          preview.className = 'ab-card-description'
          preview.textContent = description
          card.querySelector('.card-service-tags')?.before(preview)
        })
      }

      window.__showAbStage(list, caption, 'card', width)
    }, {
      descriptions: descriptionByProgram,
      caption: withDescription ? 'B · With description preview' : 'A · Without description preview',
      width: profile.widths.card,
      withDescription,
    })

    await saveStage(page, 'card-preview', `${profile.name}-card-preview-${withDescription ? 'b' : 'a'}.png`)
  } finally {
    await context.close()
  }
}

async function captureProgramDetail(profile, contactAtBottom) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    await page.getByRole('searchbox').fill('Companion Services')
    await page.locator('.program-card', { hasText: 'Companion Services' }).first().click()
    await page.locator('.detail-panel').waitFor()

    await page.evaluate(({ caption, width, contactAtBottom }) => {
      const panel = document.querySelector('.detail-panel').cloneNode(true)
      if (contactAtBottom) {
        const contactLabel = [...panel.querySelectorAll('.detail-label')]
          .find((label) => label.textContent.trim() === 'Get in touch')
        const contactSection = contactLabel?.closest('.detail-section')
        const divider = contactSection?.nextElementSibling?.matches('.detail-divider')
          ? contactSection.nextElementSibling
          : null
        const bottomClose = [...panel.querySelectorAll(':scope > .detail-close-btn')].at(-1)
        if (contactSection && bottomClose) {
          panel.insertBefore(contactSection, bottomClose)
          if (divider) panel.insertBefore(divider, bottomClose)
        }
      }
      window.__showAbStage(panel, caption, 'detail', width)
    }, {
      caption: contactAtBottom ? 'B · Contact information at the bottom' : 'A · Contact information at the top',
      width: profile.widths.detail,
      contactAtBottom,
    })

    await saveStage(page, 'program-detail', `${profile.name}-program-detail-${contactAtBottom ? 'b' : 'a'}.png`)
  } finally {
    await context.close()
  }
}

async function captureServiceFilter(profile, dropdown) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    if (dropdown) {
      await page.locator('.service-select-trigger').evaluate((button) => button.click())
      await page.locator('.service-select-list').waitFor({ state: 'attached' })
    }

    await page.evaluate(({ caption, dropdown, groups, width }) => {
      let group
      if (dropdown) {
        group = document.querySelector('#filter-service-label').closest('.filter-group').cloneNode(true)
      } else {
        group = document.createElement('div')
        group.className = 'filter-group'
        const label = document.createElement('span')
        label.className = 'filter-group-label'
        label.textContent = 'Select service type'
        const options = document.createElement('div')
        options.className = 'ab-checkbox-list'
        groups.forEach((text) => {
          const option = document.createElement('label')
          option.className = 'ab-checkbox-choice'
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          const optionText = document.createElement('span')
          optionText.textContent = text
          option.append(checkbox, optionText)
          options.append(option)
        })
        group.append(label, options)
      }
      if (dropdown) {
        const cue = document.createElement('p')
        cue.className = 'ab-scroll-cue'
        cue.textContent = '↓ Scroll to see more service types'
        group.querySelector('.service-select-wrap')?.append(cue)
      }
      window.__showAbStage(group, caption, 'filter', width)
    }, {
      caption: dropdown
        ? 'B · Drop-down menu with all service types'
        : 'A · Checkboxes with higher-order categories only',
      dropdown,
      groups: SERVICE_AREA_GROUPS.map((group) => group.group),
      width: profile.widths.filter,
    })

    await saveStage(page, 'service-type-filter', `${profile.name}-service-type-filter-${dropdown ? 'b' : 'a'}.png`)
  } finally {
    await context.close()
  }
}

async function captureLocationFilter(profile, dropdown) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    await page.evaluate(({ caption, dropdown, options, width }) => {
      let group
      if (!dropdown) {
        group = document.createElement('div')
        group.className = 'filter-group'
        const label = document.createElement('span')
        label.className = 'filter-group-label'
        label.textContent = 'Location'
        const choices = document.createElement('div')
        choices.className = 'ab-checkbox-list'
        options.forEach((location) => {
          const option = document.createElement('label')
          option.className = 'ab-checkbox-choice'
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          const optionText = document.createElement('span')
          optionText.textContent = location.label
          option.append(checkbox, optionText)
          choices.append(option)
        })
        group.append(label, choices)
      } else {
        group = document.createElement('div')
        group.className = 'filter-group'
        const label = document.createElement('span')
        label.className = 'filter-group-label'
        label.textContent = 'Location'

        const wrap = document.createElement('div')
        wrap.className = 'service-select-wrap'
        const trigger = document.createElement('button')
        trigger.type = 'button'
        trigger.className = 'filter-select service-select-trigger'
        trigger.innerHTML = '<span>All of Calgary</span><span aria-hidden="true" class="service-select-caret">▾</span>'

        const list = document.createElement('ul')
        list.className = 'service-select-list'
        ;[{ label: 'All of Calgary' }, ...options].forEach((option, index) => {
          const item = document.createElement('li')
          const button = document.createElement('button')
          button.type = 'button'
          button.className = `service-select-option${index === 0 ? ' service-select-option--active' : ''}`
          button.textContent = option.value ?? option.label
          item.append(button)
          list.append(item)
        })
        wrap.append(trigger, list)
        group.append(label, wrap)
      }
      window.__showAbStage(group, caption, 'filter', width)
    }, {
      caption: dropdown ? 'B · Location drop-down menu' : 'A · Location checkboxes',
      dropdown,
      options: QUADRANTS,
      width: profile.widths.filter,
    })

    await saveStage(page, 'location-filter', `${profile.name}-location-filter-${dropdown ? 'b' : 'a'}.png`)
  } finally {
    await context.close()
  }
}

async function captureContextCardPreview(profile, withDescription) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    await page.getByRole('searchbox').fill('transportation')
    await page.locator('.program-card').first().waitFor()

    if (withDescription) {
      await page.evaluate((descriptions) => {
        document.querySelectorAll('.program-card').forEach((card) => {
          const name = card.querySelector('.card-name')?.textContent.trim() || ''
          const organization = card.querySelector('.card-org')?.textContent.trim() || name
          const description = descriptions[`${name}\n${organization}`]
          if (!description) return
          const preview = document.createElement('p')
          preview.className = 'ab-card-description'
          preview.textContent = description
          card.querySelector('.card-service-tags')?.before(preview)
        })
      }, descriptionByProgram)
    }

    const scrollTop = profile.name === 'mobile'
      ? await page.evaluate(() => Math.max(
        0,
        (document.querySelector('#main-content')?.offsetTop ?? 0) - 12
      ))
      : 0

    await saveContext(
      page,
      'card-preview',
      `${profile.name}-card-preview-context-${withDescription ? 'b' : 'a'}.png`,
      scrollTop
    )
  } finally {
    await context.close()
  }
}

async function openContextFilters(page, profile) {
  if (profile.name !== 'mobile') return
  await page.getByRole('button', { name: /Filters/ }).click()
  await page.locator('.filter-aside--open').waitFor()
}

async function captureContextServiceFilter(profile, dropdown) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    await page.getByRole('searchbox').fill('transportation')
    await page.locator('.program-card').first().waitFor()
    await openContextFilters(page, profile)

    const serviceGroup = page.locator('#filter-service-label').locator('..')
    if (dropdown) {
      await serviceGroup.scrollIntoViewIfNeeded()
      await serviceGroup.locator('.service-select-trigger').click()
      await serviceGroup.locator('.service-select-list').waitFor()
    } else {
      await page.evaluate((groups) => {
        const group = document.querySelector('#filter-service-label')?.closest('.filter-group')
        const existing = group?.querySelector('.service-select-wrap')
        if (!group || !existing) return

        const choices = document.createElement('div')
        choices.className = 'ab-checkbox-list'
        groups.forEach((text) => {
          const option = document.createElement('label')
          option.className = 'ab-checkbox-choice'
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          const optionText = document.createElement('span')
          optionText.textContent = text
          option.append(checkbox, optionText)
          choices.append(option)
        })
        existing.replaceWith(choices)
      }, SERVICE_AREA_GROUPS.map((group) => group.group))
      await serviceGroup.scrollIntoViewIfNeeded()
    }

    await saveContext(
      page,
      'service-type-filter',
      `${profile.name}-service-type-filter-context-${dropdown ? 'b' : 'a'}.png`
    )
  } finally {
    await context.close()
  }
}

async function captureContextLocationFilter(profile, dropdown) {
  const { context, page } = await openPage(profile)
  try {
    await enterDirectSearch(page)
    await page.getByRole('searchbox').fill('transportation')
    await page.locator('.program-card').first().waitFor()
    await openContextFilters(page, profile)

    await page.evaluate(({ dropdown, options }) => {
      const group = document.querySelector('.filter-panel .filter-group')
      if (!group) return

      const label = group.querySelector('.filter-group-label')
      if (label) label.textContent = 'Location'

      if (!dropdown) {
        const choices = document.createElement('div')
        choices.className = 'ab-checkbox-list'
        options.forEach((location) => {
          const option = document.createElement('label')
          option.className = 'ab-checkbox-choice'
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          const optionText = document.createElement('span')
          optionText.textContent = location.label
          option.append(checkbox, optionText)
          choices.append(option)
        })
        group.querySelector('.checkbox-options')?.replaceWith(choices)
        return
      }

      const wrap = document.createElement('div')
      wrap.className = 'service-select-wrap'
      const trigger = document.createElement('button')
      trigger.type = 'button'
      trigger.className = 'filter-select service-select-trigger'
      trigger.innerHTML = '<span>All of Calgary</span><span aria-hidden="true" class="service-select-caret">▾</span>'

      const list = document.createElement('ul')
      list.className = 'service-select-list'
      ;[{ label: 'All of Calgary' }, ...options].forEach((location, index) => {
        const item = document.createElement('li')
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `service-select-option${index === 0 ? ' service-select-option--active' : ''}`
        button.textContent = location.value ?? location.label
        item.append(button)
        list.append(item)
      })
      wrap.append(trigger, list)
      group.querySelector('.checkbox-options')?.replaceWith(wrap)
    }, { dropdown, options: QUADRANTS })

    const locationGroup = page.locator('.filter-panel .filter-group').first()
    await locationGroup.scrollIntoViewIfNeeded()
    await saveContext(
      page,
      'location-filter',
      `${profile.name}-location-filter-context-${dropdown ? 'b' : 'a'}.png`
    )
  } finally {
    await context.close()
  }
}

async function composePair(profile, comparison) {
  const [a, b] = await Promise.all([
    readFile(artifactPath(comparison.slug, `${profile.name}-${comparison.slug}-a.png`)),
    readFile(artifactPath(comparison.slug, `${profile.name}-${comparison.slug}-b.png`)),
  ])
  const page = await browser.newPage({ viewport: { width: profile.name === 'mobile' ? 820 : 1800, height: 900 } })
  try {
    await page.setContent(`
      <!doctype html>
      <html><head><style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #e9edf0; color: #202428; font-family: "Segoe UI", Arial, sans-serif; }
        #sheet { width: max-content; padding: 28px; }
        h1 { margin: 0 0 6px; font-size: 28px; }
        p { margin: 0 0 22px; font-size: 18px; }
        .pair { display: flex; align-items: flex-start; gap: 24px; }
        img { display: block; width: auto; max-width: none; height: auto; box-shadow: 0 2px 8px rgb(0 0 0 / 0.18); }
      </style></head><body>
        <main id="sheet">
          <h1>${comparison.title}</h1>
          <p>${profile.name === 'mobile' ? 'Mobile' : 'Desktop'} comparison</p>
          <div class="pair">
            <img alt="Variant A" src="data:image/png;base64,${a.toString('base64')}">
            <img alt="Variant B" src="data:image/png;base64,${b.toString('base64')}">
          </div>
        </main>
      </body></html>
    `, { waitUntil: 'load' })
    await page.locator('#sheet').screenshot({
      path: artifactPath(comparison.slug, `${profile.name}-${comparison.slug}-comparison.png`),
    })
  } finally {
    await page.close()
  }
}

async function composeContextPair(profile, comparison) {
  const [a, b] = await Promise.all([
    readFile(artifactPath(comparison.slug, `${profile.name}-${comparison.slug}-context-a.png`)),
    readFile(artifactPath(comparison.slug, `${profile.name}-${comparison.slug}-context-b.png`)),
  ])
  const viewportWidth = profile.name === 'mobile' ? 920 : 2700
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: 1100 } })
  try {
    await page.setContent(`
      <!doctype html>
      <html><head><style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #e9edf0; color: #202428; font-family: "Segoe UI", Arial, sans-serif; }
        #sheet { width: max-content; padding: 28px; }
        h1 { margin: 0 0 6px; font-size: 28px; }
        .subtitle { margin: 0 0 22px; font-size: 18px; }
        .pair { display: flex; align-items: flex-start; gap: 24px; }
        .variant { width: max-content; }
        h2 {
          max-width: ${profile.viewport.width}px;
          min-height: 70px;
          margin: 0;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          background: #143e52;
          color: white;
          font-size: 21px;
          line-height: 1.3;
          border-radius: 10px 10px 0 0;
        }
        img { display: block; width: auto; max-width: none; height: auto; box-shadow: 0 2px 8px rgb(0 0 0 / 0.18); }
      </style></head><body>
        <main id="sheet">
          <h1>${comparison.title}</h1>
          <p class="subtitle">${profile.name === 'mobile' ? 'Mobile' : 'Desktop'} · Full interface context</p>
          <div class="pair">
            <section class="variant">
              <h2>A · ${comparison.aLabel}</h2>
              <img alt="Variant A in full interface context" src="data:image/png;base64,${a.toString('base64')}">
            </section>
            <section class="variant">
              <h2>B · ${comparison.bLabel}</h2>
              <img alt="Variant B in full interface context" src="data:image/png;base64,${b.toString('base64')}">
            </section>
          </div>
        </main>
      </body></html>
    `, { waitUntil: 'load' })
    await page.locator('#sheet').screenshot({
      path: artifactPath(comparison.slug, `${profile.name}-${comparison.slug}-context-comparison.png`),
    })
  } finally {
    await page.close()
  }
}

try {
  for (const profile of profiles) {
    await captureCardPreview(profile, false)
    await captureCardPreview(profile, true)
    await captureProgramDetail(profile, false)
    await captureProgramDetail(profile, true)
    await captureServiceFilter(profile, false)
    await captureServiceFilter(profile, true)
    await captureLocationFilter(profile, false)
    await captureLocationFilter(profile, true)

    for (const comparison of comparisons) {
      await composePair(profile, comparison)
    }

    await captureContextCardPreview(profile, false)
    await captureContextCardPreview(profile, true)
    await captureContextServiceFilter(profile, false)
    await captureContextServiceFilter(profile, true)
    await captureContextLocationFilter(profile, false)
    await captureContextLocationFilter(profile, true)

    for (const comparison of contextComparisons) {
      await composeContextPair(profile, comparison)
    }
  }
} finally {
  await browser.close()
}

console.log(`A/B screenshots saved to ${outputDir}`)
