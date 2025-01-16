import { fetchAllSites } from './fetchSites.js';
import { scrapeMetadata } from './scraper.js';
import {generateHTML} from './generator.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchManualSites() {
  try {
    const manualSitesPath = path.join(__dirname, '../manualSites.json');
    if (fs.existsSync(manualSitesPath)) {
      const manualSites = JSON.parse(fs.readFileSync(manualSitesPath, 'utf-8'));
      return manualSites.map((site) => ({ ...site, public: true }));
    }
    return [];
  } catch (error) {
    console.error('Error reading manual sites:', error.message);
    return [];
  }
}

    console.log('Fetching sites from API...');
    const apiSites = await fetchAllSites();
  
    console.log('Fetching manual sites...');
    const manualSites = await fetchManualSites();
  
    const allSites = [...apiSites, ...manualSites];
  
    console.log('Scraping metadata...');
    const siteData = await Promise.all(
      allSites.map(async (site) => {
        if (site.metadata?.title && site.metadata?.description) {
          return site; // Use existing metadata if available
        }
        const metadata = await scrapeMetadata(site.links.http?.link || `https://${site.domain}`);
        return { ...site, metadata };
      })
    );
  
    console.log('Generating HTML...');
    generateHTML(siteData);
  
    const outputJSON = path.join(__dirname, '../public', 'sites.json');
    fs.writeFileSync(outputJSON, JSON.stringify(siteData, null, 2), 'utf-8');
    console.log(`Site list saved to ${outputJSON}`);
