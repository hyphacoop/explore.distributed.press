import { fetchAllSites } from './fetchSites.js'
import { scrapeMetadata } from './scraper.js'
import { generateHTML } from './generator.js'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function fetchManualSites () {
  try {
    const manualSitesPath = path.join(__dirname, '../manualSites.json')
    if (fs.existsSync(manualSitesPath)) {
      const manualSites = JSON.parse(fs.readFileSync(manualSitesPath, 'utf-8'))
      return manualSites.map((site) => ({ ...site, public: true }))
    }
    return []
  } catch (error) {
    console.error('Error reading manual sites:', error.message)
    return []
  }
}

async function checkErroredSites (sites) {
  const validSites = []
  const erroredSites = []

  for (const site of sites) {
    try {
      const response = await globalThis.fetch(site.links.http?.link || `https://${site.domain}`)
      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }
      validSites.push(site)
    } catch (error) {
      console.warn(`Site ${site.domain} is unreachable: ${error.message}`)
      erroredSites.push(site)
    }
  }

  return { validSites, erroredSites }
}

console.log('Fetching sites from API...')
const apiSites = await fetchAllSites()

console.log('Fetching manual sites...')
const manualSites = await fetchManualSites()

const allSites = [...apiSites, ...manualSites]

console.log('Checking for errored sites...')
const { validSites, erroredSites } = await checkErroredSites(allSites)

console.log('Scraping metadata...')
const siteData = await Promise.all(
  validSites.map(async (site) => {
    if (site.metadata?.title && site.metadata?.description) {
      return site // Use existing metadata if available
    }
    const metadata = await scrapeMetadata(site.links.http?.link || `https://${site.domain}`)
    return { ...site, metadata }
  })
)

console.log('Generating HTML...')
generateHTML(siteData)

const sitesOutputPath = path.join(__dirname, '../public', 'sites.json')
const erroredOutputPath = path.join(__dirname, '../public', 'erroredSites.json')

fs.writeFileSync(sitesOutputPath, JSON.stringify(siteData, null, 2), 'utf-8')
console.log(`Valid site list saved to ${sitesOutputPath}`)

fs.writeFileSync(erroredOutputPath, JSON.stringify(erroredSites, null, 2), 'utf-8')
console.log(`Errored site list saved to ${erroredOutputPath}`)
