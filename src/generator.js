import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function trimHash (hash, length = 20) {
  return hash.length > length ? `${hash.slice(0, length)}...` : hash
}

// Manually list organizational subdomains that should be prioritized
const prioritizedSubdomains = [
  'try.distributed.press',
  'three.compost.digital'
]

// Function to check if the domain is a root domain or a subdomain
function isRootDomain (domain) {
  const parts = domain.split('.')
  return parts.length <= 2 || domain.startsWith('www.') || prioritizedSubdomains.includes(domain)
}

// Function to filter out non-www duplicates
function filterSites (sites) {
  const domainMap = new Map()

  sites.forEach(site => {
    const baseDomain = site.domain.replace(/^www\./, '')

    if (!domainMap.has(baseDomain)) {
      domainMap.set(baseDomain, site)
    } else if (site.domain.startsWith('www.')) {
      domainMap.set(baseDomain, site) // Keep www. version if both exist
    }
  })

  return Array.from(domainMap.values())
}

// Sort sites: Root domains and prioritized subdomains first, other subdomains later
function sortSites (sites) {
  return sites.sort((a, b) => {
    const aRoot = isRootDomain(a.domain)
    const bRoot = isRootDomain(b.domain)

    if (aRoot && !bRoot) return -1
    if (!aRoot && bRoot) return 1

    const aIsSutty = a.domain.endsWith('.sutty.nl')
    const bIsSutty = b.domain.endsWith('.sutty.nl')
    if (aIsSutty && !bIsSutty) return 1
    if (!aIsSutty && bIsSutty) return -1

    return a.domain.localeCompare(b.domain) // Alphabetical sorting as a fallback
  })
}

function generateHTML (sites) {
  const filteredSites = filterSites(sites)
  const sortedSites = sortSites(filteredSites)
  const totalCount = sortedSites.length

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Explore the Distributed Press ecosystem. Find sites leveraging decentralized publishing.">
        <!-- icons -->
        <link rel="icon" type="image/png" href="favicon-96x96.png" sizes="96x96">
        <link rel="icon" type="image/png" href="favicon-32x32.png" sizes="32x32">

        <title>Distributed Press Site Index</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <div class="container">
          <!-- DP Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="//distributed.press" target="_blank">
              <img
                alt="Distributed Press"
                src="//distributed.press/img/logos/logo-distributedpress-grey.png"
                style="width: 200px; height: auto;"
              />
            </a>
          </div>
          <!-- Total Count -->
          <p style="text-align: center; font-weight: bold;">Total Websites: ${totalCount}</p>
          <!-- Welcome and Additional Links -->
          <p>Welcome to the Distributed Press Site Index. Below is a list of sites currently using Distributed Press.</p>
          <p style="margin-bottom: 20px; font-size: 12px;">
            Didn't see your site here? Please make an 
            <a href="https://github.com/hyphacoop/explore.distributed.press/issues" target="_blank">issue</a>. 
            To view the native URLs, use P2P browsers like 
            <a href="//agregore.mauve.moe/" target="_blank">Agregore</a> and 
            <a href="//peersky.p2plabs.xyz/" target="_blank">Peersky</a>.
          </p>
          <!-- Table -->
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Title</th>
                <th>Description</th>
                <th>URLs</th>
                <th>IPFS PubKey</th>
                <th>Hyper PubKey</th>
              </tr>
            </thead>
            <tbody>
              ${sortedSites
                .map(
                  (site) => `
                  <tr>
                    <td><a href="${site.links.http?.link || '#'}" target="_blank">${site.domain}</a></td>
                    <td>${site.metadata.title || 'No Title Available'}</td>
                    <td>${site.metadata.description || 'No Description Available'}</td>
                    <td>
                      ${site.links.http?.link ? `<a href="${site.links.http.link}" target="_blank">[http]</a>` : ''}
                      ${site.links.ipfs?.enabled ? `<a href="https://ipfs.hypha.coop/ipns/${site.domain}/" target="_blank">[ipfs]</a>` : ''}
                      ${site.links.hyper?.enabled ? `<a href="https://hyper.hypha.coop/hyper/${site.domain}/" target="_blank">[hyper]</a>` : ''}
                    </td>
                    <td>${site.links.ipfs?.pubKey ? `<a href="${site.links.ipfs.pubKey}" target="_blank">${trimHash(site.links.ipfs.pubKey)}</a>` : 'Not Available'}</td>
                    <td>${site.links.hyper?.raw ? `<a href="${site.links.hyper.raw}" target="_blank">${trimHash(site.links.hyper.raw)}</a>` : 'Not Available'}</td>
                  </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
          <!-- Powered By Section -->
          <footer style="margin-top: 40px; font-size: 12px;">
            <div style="display: inline-block; text-align: center; margin-top: 20px; padding: 8px;">
              <div>Powered by</div>
              <a href="//distributed.press" target="_blank">
                <img
                  alt="Distributed Press"
                  src="//distributed.press/img/logos/logo-distributedpress-grey.png"
                  style="width: 123px; height: auto; margin-top: 10px;"
                />
              </a>
              <p>
                <a href="//reader.distributed.press" target="_blank">Follow on ActivityPub</a> |
                <a href="//docs.distributed.press" target="_blank">Learn More</a>
              </p>
            </div>
          </footer>
        </div>
    </body>
    </html>
  `

  const outputPath = path.join(__dirname, '../public/index.html')
  fs.writeFileSync(outputPath, htmlContent, 'utf-8')
  console.log(`Site index generated at ${outputPath}`)
}

export { generateHTML }
