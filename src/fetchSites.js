import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const knownInstancesPath = path.join(__dirname, './knownInstances.json')
const knownInstances = JSON.parse(fs.readFileSync(knownInstancesPath, 'utf-8'))

const API_ENDPOINT = `${knownInstances}/sites`

async function fetchFromAPI () {
  try {
    const response = await globalThis.fetch(API_ENDPOINT)
    if (!response.ok) {
      throw new Error(`Failed to fetch API: ${response.statusText}`)
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      return data // The API now returns full site data.
    } else {
      console.error('API response is not an array of site objects:', data)
      return []
    }
  } catch (error) {
    console.error(`Error fetching from API: ${error.message}`)
    return []
  }
}

export async function fetchAllSites () {
  const apiSites = await fetchFromAPI()

  // The API already includes full site data with P2P links.
  const uniqueSites = []
  const domains = new Set()

  for (const site of apiSites) {
    if (!domains.has(site.domain)) {
      domains.add(site.domain)
      uniqueSites.push(site)
    }
  }

  return uniqueSites
}
