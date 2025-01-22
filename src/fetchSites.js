import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const knownInstancesPath = path.join(__dirname, './knownInstances.json')
const knownInstances = JSON.parse(fs.readFileSync(knownInstancesPath, 'utf-8'))

async function fetchFromAPI (instance) {
  const API_ENDPOINT = `${instance}/sites`
  try {
    const response = await globalThis.fetch(API_ENDPOINT)
    if (!response.ok) {
      throw new Error(`Failed to fetch API from ${API_ENDPOINT}: ${response.statusText}`)
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      return data // The API now returns full site data.
    } else {
      console.error(`API response from ${API_ENDPOINT} is not an array of site objects:`, data)
      return []
    }
  } catch (error) {
    console.error(`Error fetching from API (${API_ENDPOINT}): ${error.message}`)
    return []
  }
}

export async function fetchAllSites () {
  const allSites = []

  // Iterate over known instances and fetch data from each
  for (const instance of knownInstances) {
    console.log(`Fetching from known instance: ${instance}`)
    const sites = await fetchFromAPI(instance)
    allSites.push(...sites)
  }

  // Deduplicate sites based on domain
  const uniqueSites = []
  const domains = new Set()

  for (const site of allSites) {
    if (!domains.has(site.domain)) {
      domains.add(site.domain)
      uniqueSites.push(site)
    }
  }

  return uniqueSites
}
