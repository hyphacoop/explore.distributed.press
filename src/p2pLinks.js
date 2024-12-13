async function loadFetch() {
    const fetchModule = await import('node-fetch');
    return fetchModule.default || fetchModule;
}

async function fetchP2PLinks(domain) {
  const hyperUrl = `https://${domain}/.well-known/hyper`;
  const ipfsUrl = `https://${domain}/.well-known/ipfs`;

  const links = { hyper: { enabled: false }, ipfs: { enabled: false } };

  try {
    const fetch = await loadFetch();

    // Fetch Hyper link
    try {
      const hyperResponse = await fetch(hyperUrl);
      if (hyperResponse.ok) {
        const hyperLink = await hyperResponse.text();
        links.hyper = { enabled: true, link: hyperLink.trim() };
      } else {
        console.warn(`Hyper endpoint for ${domain} returned status ${hyperResponse.status}`);
      }
    } catch (error) {
      console.warn(`Error fetching Hyper link for ${domain}:`, error.message);
    }

    // Fetch IPFS link
    try {
      const ipfsResponse = await fetch(ipfsUrl);
      if (ipfsResponse.ok) {
        const ipfsLink = await ipfsResponse.text();
        links.ipfs = { enabled: true, link: ipfsLink.trim() };
      } else {
        console.warn(`IPFS endpoint for ${domain} returned status ${ipfsResponse.status}`);
      }
    } catch (error) {
      console.warn(`Error fetching IPFS link for ${domain}:`, error.message);
    }
  } catch (error) {
    console.error(`Failed to fetch P2P links for ${domain}:`, error.message);
  }

  return links;
}

module.exports = fetchP2PLinks;
