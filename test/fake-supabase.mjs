// A tiny stand-in for Supabase's REST interface, so the dashboard can be tested without the internet or real keys.
// It understands just what the dashboard asks for: eq / lt / gt filters, order, limit. It logs every request it receives.
import http from 'node:http'

export const FIXTURE = {
  public_runs: [
    { market_date: '2026-10-07', status: 'finished', note: null, passed_screen: 2, universe_size: 100 },
    { market_date: '2026-10-08', status: 'skipped', note: 'market holiday', passed_screen: null, universe_size: null },
    { market_date: '2026-10-09', status: 'finished', note: null, passed_screen: 3, universe_size: 100 },
  ],
  public_daily_equity: [
    { market_date: '2026-10-07', starting_balance: 100000, ending_balance: 100500, pnl: 500, trades: 1, benchmark_pct: 0.2, capital_used: 25000 },
    { market_date: '2026-10-09', starting_balance: 100500, ending_balance: 100200, pnl: -300, trades: 1, benchmark_pct: -0.1, capital_used: 20000 },
  ],
  public_trades: [
    { market_date: '2026-10-07', symbol: 'ABB', catalyst_type: 'earnings', entry: 5000, stop: 4950, target: 5075, shares: 5, cost: 25000, outcome: 'target_hit', exit_price: 5100, exit_time: null, pnl: 500 },
    { market_date: '2026-10-09', symbol: 'ITC', catalyst_type: 'order_win', entry: 400, stop: 396, target: 406, shares: 50, cost: 20000, outcome: 'stop_hit', exit_price: 394, exit_time: null, pnl: -300 },
  ],
  public_candidates: [
    { market_date: '2026-10-07', run_id: 1, symbol: 'ABB', rank: 1, price: 5000, change_pct: 2.1, rel_volume: 2.5, avg_range: 100 },
    { market_date: '2026-10-07', run_id: 1, symbol: 'TCS', rank: 2, price: 4000, change_pct: 1.1, rel_volume: 1.5, avg_range: 80 },
    { market_date: '2026-10-09', run_id: 3, symbol: 'ITC', rank: 1, price: 400, change_pct: 1.6, rel_volume: 2.0, avg_range: 8 },
    { market_date: '2026-10-09', run_id: 3, symbol: 'INFY', rank: 2, price: 1500, change_pct: 0.9, rel_volume: 1.2, avg_range: 30 },
    { market_date: '2026-10-09', run_id: 3, symbol: 'WIPRO', rank: 3, price: 250, change_pct: 0.7, rel_volume: 1.1, avg_range: 5 },
  ],
  public_headlines: [
    { market_date: '2026-10-09', run_id: 3, symbol: 'ITC', position: 2, title: 'Second headline', source: 'Example', published_at: null, url: 'https://example.com/2' },
    { market_date: '2026-10-09', run_id: 3, symbol: 'ITC', position: 1, title: 'First headline', source: 'Example', published_at: null, url: 'https://example.com/1' },
  ],
  public_verdicts: [
    { market_date: '2026-10-09', run_id: 3, symbol: 'ITC', has_catalyst: true, bullish: true, strength: 'strong', catalyst_type: 'order_win', reason: 'Big order', cited_positions: [1], overruled_by_code: false, on_watchlist: true },
  ],
  public_plans: [
    { market_date: '2026-10-09', run_id: 3, symbol: 'ITC', status: 'accepted', rejection_reason: null, entry: 400, stop: 396, target: 406, shares: 50, cost: 20000, outcome: 'stop_hit', exit_price: 394, pnl: -300 },
  ],
  public_blog_posts: [],
}

/** Starts the stand-in on a free local port. `state.failing` makes a view answer with an error; `state.empty` makes it answer with no rows. */
export async function startFakeSupabase(tables = FIXTURE) {
  const log = []
  const state = { failing: new Set(), empty: new Set() }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    log.push({ path: url.pathname, search: url.search, apikey: req.headers.apikey, authorization: req.headers.authorization })
    res.setHeader('content-type', 'application/json')

    const view = url.pathname.replace('/rest/v1/', '')
    if (state.failing.has(view)) {
      res.statusCode = 500
      res.end(JSON.stringify({ code: 'XX000', message: 'SECRET internal detail about the database' }))
      return
    }
    if (!url.pathname.startsWith('/rest/v1/') || !(view in tables)) {
      res.statusCode = 404
      res.end(JSON.stringify({ code: 'PGRST205', message: 'not found' }))
      return
    }

    let rows = state.empty.has(view) ? [] : [...tables[view]]
    for (const [key, value] of url.searchParams) {
      if (['select', 'order', 'limit', 'offset'].includes(key)) continue
      const match = /^(eq|lt|gt)\.(.*)$/.exec(value)
      if (!match) continue
      const [, op, wanted] = match
      rows = rows.filter((r) => (op === 'eq' ? String(r[key]) === wanted : op === 'lt' ? String(r[key]) < wanted : String(r[key]) > wanted))
    }
    const order = url.searchParams.get('order')
    if (order) {
      const [column, direction] = order.split('.')
      rows.sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (direction === 'desc' ? -1 : 1))
    }
    res.end(JSON.stringify(rows.slice(0, Number(url.searchParams.get('limit') || 1000))))
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    log,
    state,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}
