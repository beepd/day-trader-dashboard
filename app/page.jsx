import Dashboard from '../components/Dashboard'
import { getOverviewData, getDaysData, getTradesData, getBlogPosts } from '../lib/queries'
import { isDemo } from '../lib/supabase'
import { isValidISODate, safeUrl } from '../lib/utils'
import { BLOG_URL, SITE_URL } from '../lib/site'
import { TAB_SEO } from '../lib/seo'

// Reading searchParams makes this page render on every request. How fresh the data is comes from the short
// cache in lib/supabase.js (5 minutes by default; DASHBOARD_CACHE_SECONDS=0 turns it off).

const TABS = ['overview', 'days', 'trades', 'blog', 'about']

// Each tab gets its own title, description and canonical address for search engines.
// Overview (and the old blog tab address) keep the site-wide values from layout.jsx.
// The ?date= part of the Day by Day tab is left out of the canonical, so all dates count as one page.
export function generateMetadata({ searchParams }) {
  const seo = TAB_SEO[searchParams?.tab]
  if (!seo) return {}
  return {
    title: seo.title,
    description: seo.description,
    // Next.js drops the ?tab part from a canonical set here, so the canonical for tab pages is
    // written as a plain <link> in the page below instead; this switches off the home-page one from layout.jsx
    alternates: { canonical: null },
    openGraph: { title: seo.title, description: seo.description, type: 'website' },
  }
}

export default async function Home({ searchParams }) {
  const tab = TABS.includes(searchParams?.tab) ? searchParams.tab : 'overview'
  const requestedDate = isValidISODate(searchParams?.date) ? searchParams.date : null

  let data = null
  let failed = false
  try {
    if (tab === 'overview') data = await getOverviewData()
    else if (tab === 'days') data = await getDaysData(requestedDate)
    else if (tab === 'trades') data = await getTradesData()
    else if (tab === 'blog') data = { posts: await getBlogPosts() }
  } catch (error) {
    // Only the error code is logged, and visitors never see it
    console.error('dashboard data load failed:', error?.code || error?.name || 'unknown', error?.view || '')
    failed = true
  }

  const seo = TAB_SEO[tab]
  return (
    <>
      {seo && <link rel="canonical" href={new URL(seo.path, SITE_URL).href} />}
      <Dashboard tab={tab} data={data} failed={failed} demo={isDemo()} blogUrl={safeUrl(process.env.BLOG_URL || '') || BLOG_URL} />
    </>
  )
}
