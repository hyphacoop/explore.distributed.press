import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateHTML(sites) {
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
        <h1>Distributed Press Site Index</h1>
        <p>Welcome to the Distributed Press Site Index. Below is a list of sites currently using Distributed Press.</p>
        <ul>
            ${sites
              .map(
                (site) => `
                <li>
                    <a href="${site.links.http?.link || '#'}" target="_blank">${site.domain}</a>
                    <p><strong>Title:</strong> ${site.metadata.title}</p>
                    <p><strong>Description:</strong> ${site.metadata.description}</p>
                    <p><strong>Hyper Link:</strong> ${
                      site.links.hyper?.enabled
                        ? `<a href="${site.links.hyper.link}" target="_blank">${site.links.hyper.link}</a>`
                        : 'Not Available'
                    }</p>
                    <p><strong>IPFS Link:</strong> ${
                      site.links.ipfs?.enabled
                        ? `<a href="${site.links.ipfs.link}" target="_blank">${site.links.ipfs.link}</a>`
                        : 'Not Available'
                    }</p>
                </li>
                `
              )
              .join('')}
        </ul>
    </body>
    </html>
  `;

  const outputPath = path.join(__dirname, '../public/index.html');
  fs.writeFileSync(outputPath, htmlContent, 'utf-8');
  console.log(`Site index generated at ${outputPath}`);
}

export { generateHTML };
