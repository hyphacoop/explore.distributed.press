# explore.distributed.press

This project generates a website listing sites using [Distributed Press](https://distributed.press/). The index is dynamically generated by filtering, sorting, and sanitizing data from available [instances](./src/knownInstances.json). The generated page is a static HTML file that helps users discover and explore DWeb sites.


## Adding a Manual Site

Some sites may not be auto-crawled, but you can manually add them. To do this, edit the site data file ([manualSites.json](./manualSites.json)) and append a new entry:
```js
[
    {
      "domain": "manual-site-1.com",
      "metadata": {
        "title": "Manually Added Site",
        "description": "This site was added manually."
      },
      "links": {
        "http": {
          "enabled": true,
          "link": "http://manual-site-1.com"
        },
        "hyper": {
          "enabled": false
        },
        "ipfs": {
          "enabled": false
        }
      },
      "public": true
    }
]
```

- After adding sites, generate the index by running:
```sh
npm start
```

This will generate files for the indexer in the `[./public](./public/)` directory.