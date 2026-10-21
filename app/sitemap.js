import { SITE_URL } from '../lib/site'
import { SITEMAP_TABS } from '../lib/seo'

// Served at /sitemap.xml. It lists the pages you want Google to index:
// the home page (overview) plus the Day by Day, All trades and About tabs.
// The blog is a separate site, so it is not listed here. The data changes every trading day, so "daily".
export default function sitemap() {
  const now = new Date()
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    ...SITEMAP_TABS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === '/?tab=about' ? 'monthly' : 'daily',
      priority: path === '/?tab=about' ? 0.4 : 0.7,
    })),
  ]
}
