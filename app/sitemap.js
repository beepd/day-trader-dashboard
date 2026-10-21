import { SITE_URL } from '../lib/site'

// Served at /sitemap.xml. It lists the pages you want Google to index.
// For now only the home page: the tabs (?tab=days and so on) all point to "/" as their
// canonical address in layout.jsx, so listing them here would send mixed signals.
// The data changes every trading day, so we say "daily".
export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
