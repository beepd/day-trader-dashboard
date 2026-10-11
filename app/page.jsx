import Dashboard from '../components/Dashboard'
import { getOverviewData, getDaysData, getTradesData, getBlogPosts } from '../lib/queries'
import { isDemo } from '../lib/supabase'
import { isValidISODate, safeUrl } from '../lib/utils'
import { BLOG_URL } from '../lib/site'

// Reading searchParams makes this page render on every request. How fresh the data is comes from the short
// cache in lib/supabase.js (5 minutes by default; DASHBOARD_CACHE_SECONDS=0 turns it off).

const TABS = ['overview', 'days', 'trades', 'blog', 'about']

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

  return <Dashboard tab={tab} data={data} failed={failed} demo={isDemo()} blogUrl={safeUrl(process.env.BLOG_URL || '') || BLOG_URL} />
}
