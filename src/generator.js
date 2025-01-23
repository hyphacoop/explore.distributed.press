import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function trimHash (hash, length = 20) {
  return hash.length > length ? `${hash.slice(0, length)}...` : hash
}

function generateHTML (sites) {
  const totalCount = sites.length

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Explore the Distributed Press ecosystem. Find sites leveraging decentralized publishing.">
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
                <th>IPFS Hash</th>
                <th>Hyper Hash</th>
              </tr>
            </thead>
            <tbody>
              ${sites
                .map(
                  (site) => `
                  <tr>
                    <td><a href="${site.links.http?.link || '#'}" target="_blank">${site.domain}</a></td>
                    <td>${site.metadata.title || 'No Title Available'}</td>
                    <td>${site.metadata.description || 'No Description Available'}</td>
                    <td>
                      ${
                        site.links.http?.link
                          ? `<a href="${site.links.http.link}" target="_blank">[http]</a>`
                          : ''
                      }
                      ${
                        site.links.ipfs?.enabled
                          ? `<a href="https://ipfs.hypha.coop/ipns/${site.domain}/" target="_blank">[ipfs]</a>`
                          : ''
                      }
                      ${
                        site.links.hyper?.enabled
                          ? `<a href="https://hyper.hypha.coop/hyper/${site.domain}/" target="_blank">[hyper]</a>`
                          : ''
                      }
                    </td>
                    <td>${
                      site.links.ipfs?.pubKey
                        ? `<a href="${site.links.ipfs.pubKey}" target="_blank">${trimHash(
                            site.links.ipfs.pubKey
                          )}</a>`
                        : 'Not Available'
                    }</td>
                    <td>${
                      site.links.hyper?.raw
                        ? `<a href="${site.links.hyper.raw}" target="_blank">${trimHash(
                            site.links.hyper.raw
                          )}</a>`
                        : 'Not Available'
                    }</td>
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
