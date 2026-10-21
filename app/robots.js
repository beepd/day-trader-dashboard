import { SITE_URL } from '../lib/site'

// Served at /robots.txt. It tells search engines they may crawl everything
// and where the sitemap is.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
