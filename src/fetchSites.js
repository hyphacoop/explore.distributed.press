import { fetchP2PLinks } from './p2pLinks.js';

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const knownInstancesPath = path.join(__dirname, './knownInstances.json');
const knownInstances = JSON.parse(fs.readFileSync(knownInstancesPath, 'utf-8'));

const API_ENDPOINT = 'https://api.distributed.press/v1/sites';

async function fetchFromAPI() {
  try {
    const response = await globalThis.fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Failed to fetch API: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((domain) => ({
        domain,
        public: true,
        links: { http: { enabled: true, link: `https://${domain}` } },
      }));
    } else {
      console.error('API response is not an array of domains:', data);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching from API: ${error.message}`);
    return [];
  }
}

async function fetchFromKnownInstances() {
  const sites = [];
  for (const instance of knownInstances) {
    try {
      const fetch = await loadFetch();
      const response = await fetch(`${instance}/.well-known/distributed.press/sites`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.sites)) {
          sites.push(...data.sites);
        } else {
          console.error(`Invalid data structure from ${instance}:`, data);
        }
      } else {
        console.error(`Failed to fetch from ${instance}: Status ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching from ${instance}: ${error.message}`);
    }
  }
  return sites;
}

export async function fetchAllSites() {
    const apiSites = await fetchFromAPI();
    const knownSites = await fetchFromKnownInstances();
  
    const allSites = [...apiSites, ...knownSites];
    const uniqueSites = [];
    const domains = new Set();
  
    for (const site of allSites) {
      if (!domains.has(site.domain)) {
        domains.add(site.domain);
  
        // Fetch P2P links dynamically
        console.log(`Fetching P2P links for domain: ${site.domain}`);
        const p2pLinks = await fetchP2PLinks(site.domain);
        uniqueSites.push({ ...site, links: { ...site.links, ...p2pLinks } });
      }
    }
  
    return uniqueSites;
  }