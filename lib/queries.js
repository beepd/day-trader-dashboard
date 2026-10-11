// Everything the pages read. ONLY the read-only public_* views are touched, and only with the publishable key.
// A day appears in these views only after 3:35 PM India time; error messages and base tables are never exposed.
import { getSupabase, isDemo } from './supabase.js'
import { getDemo } from './demo.js'

const NO_DETAIL = { candidates: [], headlines: [], verdicts: [], plans: [] }

/** Read rows from one public view. Throws a plain error (no Supabase text in it) so nothing internal can leak to a page. */
async function read(view, { order, desc = false, limit = 1000, eq = {}, lt, gt } = {}) {
  let query = getSupabase().from(view).select('*')
  for (const [column, value] of Object.entries(eq)) query = query.eq(column, value)
  if (lt) query = query.lt(lt[0], lt[1])
  if (gt) query = query.gt(gt[0], gt[1])
  if (order) query = query.order(order, { ascending: !desc })
  const { data, error } = await query.limit(limit)
  if (error) {
    const failure = new Error('query failed')
    failure.code = error.code || 'QUERY'
    failure.view = view
    throw failure
  }
  return data || []
}

/** Overview: the balance day by day, and every settled trade. */
export async function getOverviewData() {
  if (isDemo()) {
    const demo = getDemo()
    return { equity: demo.equity, trades: demo.trades }
  }
  const [equity, trades] = await Promise.all([
    read('public_daily_equity', { order: 'market_date' }),
    read('public_trades', { order: 'market_date', desc: true }),
  ])
  return { equity, trades }
}

/** All trades tab: every settled trade, newest first. */
export async function getTradesData() {
  if (isDemo()) return { trades: getDemo().trades }
  return { trades: await read('public_trades', { order: 'market_date', desc: true }) }
}

/**
 * Day by day: one day's story. With no date given, the newest day that has a run is used (today is
 * usually not visible yet, because a day only appears after 3:35 PM India time).
 */
export async function getDaysData(requestedDate) {
  if (isDemo()) {
    const demo = getDemo()
    const dates = demo.runs.map((r) => r.market_date) // oldest first
    const date = requestedDate || dates[dates.length - 1] || null
    const run = demo.runs.find((r) => r.market_date === date) || null
    return {
      date, run,
      equityRow: demo.equity.find((e) => e.market_date === date) || null,
      prevDate: [...dates].reverse().find((d) => d < date) || null,
      nextDate: dates.find((d) => d > date) || null,
      ...(run?.status === 'finished' ? demo.details[date] : NO_DETAIL),
    }
  }

  let date = requestedDate
  if (!date) {
    const latest = await read('public_runs', { order: 'market_date', desc: true, limit: 1 })
    date = latest[0]?.market_date || null
  }
  if (!date) return { date: null, run: null, equityRow: null, prevDate: null, nextDate: null, ...NO_DETAIL }

  const [runs, equityRows, before, after] = await Promise.all([
    read('public_runs', { eq: { market_date: date }, limit: 1 }),
    read('public_daily_equity', { eq: { market_date: date }, limit: 1 }),
    read('public_runs', { lt: ['market_date', date], order: 'market_date', desc: true, limit: 1 }),
    read('public_runs', { gt: ['market_date', date], order: 'market_date', limit: 1 }),
  ])
  const run = runs[0] || null

  let detail = NO_DETAIL
  if (run?.status === 'finished') {
    const eq = { market_date: date }
    const [candidates, headlines, verdicts, plans] = await Promise.all([
      read('public_candidates', { eq, order: 'rank' }),
      read('public_headlines', { eq, order: 'position' }),
      read('public_verdicts', { eq, order: 'symbol' }),
      read('public_plans', { eq, order: 'symbol' }),
    ])
    detail = { candidates, headlines, verdicts, plans }
  }

  return {
    date, run,
    equityRow: equityRows[0] || null,
    prevDate: before[0]?.market_date || null,
    nextDate: after[0]?.market_date || null,
    ...detail,
  }
}

/** Blog tab: published posts, newest first. The blog view is optional, so a failure just means "no posts". */
export async function getBlogPosts() {
  if (isDemo()) return []
  try {
    return await read('public_blog_posts', { order: 'market_date', desc: true, limit: 30 })
  } catch {
    return []
  }
}
