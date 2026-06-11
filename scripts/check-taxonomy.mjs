import { readFileSync } from 'fs'

const programs = JSON.parse(
  readFileSync('src/data/programs.json', 'utf-8')
)

// For each service area, collect every determinant it appears with
const serviceAreaMap = new Map()

for (const p of programs) {
  for (const sa of p.serviceArea) {
    if (!serviceAreaMap.has(sa)) serviceAreaMap.set(sa, new Set())
    for (const d of p.determinant) {
      serviceAreaMap.get(sa).add(d)
    }
  }
}

// Sort by service area name and print
const sorted = [...serviceAreaMap.entries()].sort(([a], [b]) => a.localeCompare(b))
for (const [sa, dets] of sorted) {
  console.log(`\n"${sa}"`)
  for (const d of [...dets].sort()) {
    console.log(`  → ${d}`)
  }
}

console.log(`\nTotal unique service areas: ${sorted.length}`)
