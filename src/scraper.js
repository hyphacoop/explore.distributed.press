import { load } from 'cheerio';

export async function scrapeMetadata(url) {
  try {
    const response = await globalThis.fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    const title = $('title').text().trim() || 'No Title Available';
    const description =
      $('meta[name="description"]').attr('content') || 'No Description Available';

    return { title, description };
  } catch (error) {
    console.error(`Error scraping ${url}: ${error.message}`);
    return { title: 'Error', description: 'Failed to fetch metadata' };
  }
}
