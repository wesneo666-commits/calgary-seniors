import { createReadStream } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { parse } from 'csv-parse'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = join(__dirname, '..', 'data-source', 'programs.csv')
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'programs.json')

// Columns that contain JSON-encoded arrays in the CSV
const ARRAY_COLUMNS = [
  'Cadence',
  'Format',
  'Cost',
  'Quadrant',
  'Determinant',
  'Service Area',
  'Additional Keywords',
  'Intended Population',
  'Source',
]

function parseArrayField(value) {
  if (!value || value.trim() === '') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((v) => v.trim()).filter(Boolean) : []
  } catch {
    // Fallback: treat as a single string value
    return [value.trim()]
  }
}

function slugify(str, index) {
  return (
    `p-${String(index + 1).padStart(4, '0')}-` +
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
  )
}

function mapRow(row, index) {
  return {
    id: slugify(row['Program/Service Name'] || '', index),
    organization: (row['Organization'] || '').trim(),
    programName: (row['Program/Service Name'] || '').trim(),
    orgWebsite: (row['Organization Website'] || '').trim(),
    programWebsite: (row['Program/Service Website'] || '').trim(),
    description: (row['Program/Service Description'] || '').trim(),
    eligibility: (row['Eligibility Criteria'] || '').trim(),
    howToAccess: (row['How to Access'] || '').trim(),
    cadence: parseArrayField(row['Cadence']),
    format: parseArrayField(row['Format']),
    cost: parseArrayField(row['Cost']),
    costDetails: (row['Cost Details'] || '').trim(),
    importantNotes: (row['Important Notes'] || '').trim(),
    phone: (row['Phone'] || '').trim(),
    email: (row['Email'] || '').trim(),
    fax: (row['Fax'] || '').trim(),
    address: (row['Address'] || '').trim(),
    quadrant: parseArrayField(row['Quadrant']),
    determinant: parseArrayField(row['Determinant']),
    serviceArea: parseArrayField(row['Service Area']),
    keywords: parseArrayField(row['Additional Keywords']),
    intendedPopulation: parseArrayField(row['Intended Population']),
    source: parseArrayField(row['Source']),
    // Optional columns requested for V5 (Microsoft Lists). Blank until the
    // client adds them; cards fall back to the full description / no date.
    shortDescription: (row['Short Description'] || '').trim(),
    lastUpdated: (row['Last Updated'] || '').trim(),
  }
}

async function run() {
  const records = []
  const errors = []

  await new Promise((resolve, reject) => {
    createReadStream(CSV_PATH)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          bom: true,
          trim: false, // we trim individual fields ourselves
          relax_quotes: true,
          relax_column_count: true,
        })
      )
      .on('data', (row) => {
        try {
          const mapped = mapRow(row, records.length)
          if (mapped.organization && mapped.programName) {
            records.push(mapped)
          }
        } catch (err) {
          errors.push({ row, err: err.message })
        }
      })
      .on('error', reject)
      .on('end', resolve)
  })

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(records, null, 2), 'utf-8')

  console.log(`✓ Imported ${records.length} programs → src/data/programs.json`)
  if (errors.length) {
    console.warn(`  ${errors.length} rows skipped due to errors`)
    errors.forEach((e) => console.warn('  -', e.err))
  }

  // Print taxonomy summary for validation
  const determinants = new Set()
  const serviceAreas = new Set()
  const quadrants = new Set()
  const costTypes = new Set()

  records.forEach((r) => {
    r.determinant.forEach((d) => determinants.add(d))
    r.serviceArea.forEach((s) => serviceAreas.add(s))
    r.quadrant.forEach((q) => quadrants.add(q))
    r.cost.forEach((c) => costTypes.add(c))
  })

  console.log('\nDeterminants found:')
  ;[...determinants].sort().forEach((d) => console.log(' ', d))
  console.log('\nService areas found:')
  ;[...serviceAreas].sort().forEach((s) => console.log(' ', s))
  console.log('\nQuadrants found:', [...quadrants].sort().join(', '))
  console.log('Cost types found:', [...costTypes].sort().join(', '))
}

run().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
