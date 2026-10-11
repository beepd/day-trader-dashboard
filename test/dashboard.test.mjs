// Offline checks for the dashboard's logic. Run: npm test   (plain Node, no internet, no real keys)
// Prints ok / BAD lines and ends with ALL CHECKS PASSED, or names the checks that failed.
process.removeAllListeners('warning') // Node's "module type" hint about the lib files is harmless noise here

const failed = []
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok ' : 'BAD'}  ${name}${ok ? '' : `   -> ${detail}`}`)
  if (!ok) failed.push(name)
}
const near = (a, b, eps = 1e-9) => typeof a === 'number' && Math.abs(a - b) <= eps
const load = (path) => import(new URL(path, import.meta.url).href)
async function rejection(promise) {
  try {
    await promise
    return null
  } catch (error) {
    return error
  }
}

const u = await load('../lib/utils.js')
const m = await load('../lib/metrics.js')
const { getDemo } = await load('../lib/demo.js')
const supa = await load('../lib/supabase.js')
const q = await load('../lib/queries.js')
const { startFakeSupabase, FIXTURE } = await load('./fake-supabase.mjs')

// ------------------------------------------------------------------ helpers
console.log('\n-- helpers')
check('num: blanks and junk become null', u.num(null) === null && u.num('') === null && u.num(undefined) === null && u.num('abc') === null)
check('num: numbers and numeric text stay numbers', u.num('12.5') === 12.5 && u.num(0) === 0)
check('fmt: missing value is a dash, not ₹0.00', u.fmt(null) === '—')
check('fmt: Indian digit grouping', u.fmt(100000) === '₹1,00,000.00', u.fmt(100000))
check('fmtPnl and fmtPct carry a sign', u.fmtPnl(-5) === '-₹5.00' && u.fmtPnl(5) === '+₹5.00' && u.fmtPct(1.234) === '+1.23%' && u.fmtPct(-0.5) === '-0.50%')
check('todayISO looks like a date', /^\d{4}-\d{2}-\d{2}$/.test(u.todayISO()), u.todayISO())
check('isValidISODate accepts a real date', u.isValidISODate('2026-10-09'))
check('isValidISODate rejects junk', ['2026-02-30', '2026-1-9', '20261009', '', null, undefined, ['2026-10-09'], '2026-10-09; drop table'].every((v) => !u.isValidISODate(v)))
check('weekend detection (Fri open, Sat and Sun closed)', !u.isWeekendIST('2026-10-09') && u.isWeekendIST('2026-10-10') && u.isWeekendIST('2026-10-11'))
check('closed info: skipped day shows its note', u.getMarketClosedInfo('2026-10-08', { status: 'skipped', note: 'market holiday' }).message.includes('market holiday'))
check('closed info: failed day', u.getMarketClosedInfo('2026-10-08', { status: 'failed' }).closed === true)
check('closed info: weekend with no run', u.getMarketClosedInfo('2026-10-10', null).message === 'Market closed (weekend)')
check('closed info: normal finished day is not closed', u.getMarketClosedInfo('2026-10-09', { status: 'finished' }).closed === false)
check('safeUrl keeps http and https', u.safeUrl('https://a.com/x') === 'https://a.com/x' && u.safeUrl(' http://a.com ') === 'http://a.com')
check('safeUrl drops dangerous or broken addresses', ['javascript:alert(1)', 'data:text/html,x', 'ftp://a', 'https://', '//a.com', null, 5].every((v) => u.safeUrl(v) === null))
check('csvCell: quotes and commas', u.csvCell('a,b') === '"a,b"' && u.csvCell('say "hi"') === '"say ""hi"""')
check('csvCell: text starting with = is defused, numbers are not', u.csvCell('=1+1', true) === "'=1+1" && u.csvCell(-5) === '-5' && u.csvCell(null) === '')
check('prettify', u.prettify('order_win') === 'order win' && u.prettify(null) === '')

// ------------------------------------------------------------------ calculations
console.log('\n-- calculations (hand-worked numbers)')
const rawEquity = [ // deliberately out of order and as text, the way a database can hand them over
  { market_date: '2026-10-05', starting_balance: '99990', ending_balance: '100500', pnl: '510', trades: 1, benchmark_pct: null },
  { market_date: '2026-10-01', starting_balance: '100000', ending_balance: '101000', pnl: '1000', trades: 1, benchmark_pct: '0.5' },
  { market_date: '2026-10-02', starting_balance: '101000', ending_balance: '99990', pnl: '-1010', trades: 2, benchmark_pct: '-1' },
]
const equity = m.cleanEquity(rawEquity)
check('cleanEquity sorts oldest first and makes numbers', equity.map((d) => d.market_date).join() === '2026-10-01,2026-10-02,2026-10-05' && equity[0].ending_balance === 101000)
const trades = m.cleanTrades([
  { market_date: '2026-10-01', symbol: 'A', pnl: '10', outcome: 'target_hit' },
  { market_date: '2026-10-02', symbol: 'B', pnl: '-5', outcome: 'stop_hit' },
  { market_date: '2026-10-02', symbol: 'C', pnl: '0', outcome: 'closed_at_end' },
  { market_date: '2026-10-05', symbol: 'D', pnl: '20', outcome: 'target_hit' },
  { market_date: '2026-10-05', symbol: 'E', pnl: null, outcome: 'closed_at_end' },
])
check('cleanTrades sorts newest first', trades[0].market_date === '2026-10-05' && trades[trades.length - 1].market_date === '2026-10-01')
const met = m.computeMetrics(equity, trades)
check('balance, total P&L and return', met.start === 100000 && met.balance === 100500 && met.totalPnl === 500 && near(met.returnPct, 0.5))
check('worst drop from a peak = 1010 / 101000 = 1%', near(met.maxDrawdownPct, 1), String(met.maxDrawdownPct))
check('best and worst day', met.bestDay === 1000 && met.worstDay === -1010)
check('win rate ignores unsettled trades; a 0 is not a win (2 of 4)', met.tradeCount === 4 && met.winRate === 50, `${met.tradeCount} ${met.winRate}`)
check('days and traded days', met.days === 3 && met.tradedDays === 3)
const losing = m.computeMetrics(m.cleanEquity([{ market_date: '2026-10-01', starting_balance: 100000, ending_balance: 99000, pnl: -1000, trades: 1 }]), [])
check('a first day that only loses still counts as a 1% drop, and no trades means no win rate', near(losing.maxDrawdownPct, 1) && losing.winRate === null)
const series = m.comparisonSeries(equity)
check('strategy line = % above the start', near(series.strategy[0], 1) && near(series.strategy[1], -0.01) && near(series.strategy[2], 0.5))
check('Nifty line compounds day by day (+0.5%, -1% => -0.505%), missing day = 0%', near(series.nifty[0], 0.5) && near(series.nifty[1], -0.505) && near(series.nifty[2], -0.505), series.nifty.join())
const bal = m.balanceSeries(equity)
check('balance series: ending balance per day, oldest first, with the starting capital', bal.balance.join() === '101000,99990,100500' && bal.start === 100000 && bal.labels[0] === '2026-10-01' && bal.pnl.join() === '1000,-1010,510', JSON.stringify(bal))
check('outcome counts', JSON.stringify(m.outcomeCounts(trades)) === '{"target_hit":2,"stop_hit":1,"closed_at_end":2}')
check('cleanEquity drops rows with no balance and derives a missing P&L',
  m.cleanEquity([{ market_date: 'x', starting_balance: null, ending_balance: 5 }, { market_date: 'y', starting_balance: 10, ending_balance: 12 }]).length === 1 &&
  m.cleanEquity([{ market_date: 'y', starting_balance: 10, ending_balance: 12 }])[0].pnl === 2)
check('verdict labels', m.verdictLabel(null).text === 'NO VERDICT' && m.verdictLabel({ on_watchlist: true }).tone === 'green' &&
  m.verdictLabel({ has_catalyst: true, strength: 'weak' }).text === 'CATALYST WEAK · NOT SELECTED' && m.verdictLabel({ has_catalyst: false }).tone === 'red')
const stats = m.dayStats({ run: { universe_size: null, passed_screen: null }, equityRow: null, candidates: [1, 2, 3], verdicts: [{ on_watchlist: true }, { on_watchlist: false }], plans: [{ status: 'accepted' }, { status: 'skipped' }] })
check('day numbers fall back sensibly (100 checked, moving = candidates, P&L pending)', stats.checked === 100 && stats.moving === 3 && stats.strong === 1 && stats.trades === 1 && stats.pnl === null)

// ------------------------------------------------------------------ demo data
console.log('\n-- demo data')
const demo = getDemo()
check('demo has weeks of days', demo.equity.length >= 25, String(demo.equity.length))
check('each day starts where the last one ended', demo.equity.every((d, i) => i === 0 || near(d.starting_balance, demo.equity[i - 1].ending_balance, 0.001)))
check('each day: ending - starting = P&L', demo.equity.every((d) => near(d.ending_balance - d.starting_balance, d.pnl, 0.011)))
check('each day: trade P&Ls add up to the day P&L', demo.equity.every((d) => near(demo.trades.filter((t) => t.market_date === d.market_date).reduce((s, t) => s + t.pnl, 0), d.pnl, 0.011)))
check('trade count per day matches the trades', demo.equity.every((d) => demo.trades.filter((t) => t.market_date === d.market_date).length === d.trades))
check('no demo day falls on a weekend', demo.runs.every((r) => !u.isWeekendIST(r.market_date)))
check('every finished day has detail, and every accepted plan has its trade', demo.runs.filter((r) => r.status === 'finished').every((r) => {
  const d = demo.details[r.market_date]
  return d && d.plans.filter((p) => p.status === 'accepted').every((p) => demo.trades.some((t) => t.market_date === r.market_date && t.symbol === p.symbol))
}))
check('stocks are unique within a day', Object.values(demo.details).every((d) => new Set(d.candidates.map((c) => c.symbol)).size === d.candidates.length))
check('demo links are safe web links', Object.values(demo.details).every((d) => d.headlines.every((h) => u.safeUrl(h.url) !== null)))

// ------------------------------------------------------------------ keys
console.log('\n-- keys: only a publishable key is accepted')
const jwt = (payload) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`
const refuses = (key) => { try { supa.assertPublicKey(key); return false } catch (e) { return e.code === 'CONFIG' } }
check('secret key (sb_secret_...) is refused', refuses('sb_secret_abc123'))
check('legacy service_role key is refused', refuses(jwt({ role: 'service_role' })))
check('publishable and anon keys are accepted', !refuses('sb_publishable_abc') && !refuses(jwt({ role: 'anon' })) && !refuses('abc.def.ghi'))

for (const name of ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'DASHBOARD_DEMO']) delete process.env[name]
let error = await rejection(Promise.resolve().then(() => supa.getSupabase()))
check('missing settings give a clear config error', error?.code === 'CONFIG')
process.env.SUPABASE_URL = 'http://127.0.0.1:9'
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_secret_oops'
error = await rejection(Promise.resolve().then(() => supa.getSupabase()))
check('a secret key in the settings stops the dashboard from reading anything', error?.code === 'CONFIG')

// ------------------------------------------------------------------ queries against the stand-in Supabase
console.log('\n-- queries (against a stand-in Supabase server)')
const fake = await startFakeSupabase()
const KEY = 'sb_publishable_test_key'
process.env.SUPABASE_URL = fake.url
process.env.SUPABASE_PUBLISHABLE_KEY = KEY
process.env.DASHBOARD_CACHE_SECONDS = '0'

const overview = await q.getOverviewData()
check('overview: balance days oldest first', overview.equity.map((d) => d.market_date).join() === '2026-10-07,2026-10-09')
check('overview: trades newest first', overview.trades[0].market_date === '2026-10-09' && overview.trades.length === 2)
check('trades tab: same trades', (await q.getTradesData()).trades.length === 2)

let day = await q.getDaysData(null)
check('days: no date given -> newest day with a run', day.date === '2026-10-09' && day.run.status === 'finished')
check('days: neighbours skip nothing that has a record (prev = holiday row, no next)', day.prevDate === '2026-10-08' && day.nextDate === null)
check('days: only that day\'s stocks, in rank order', day.candidates.map((c) => c.symbol).join() === 'ITC,INFY,WIPRO')
check('days: headlines in position order', day.headlines.map((h) => h.position).join() === '1,2')
check('days: verdicts, plans and the day\'s balance row', day.verdicts.length === 1 && day.plans.length === 1 && day.equityRow.pnl === -300)

const before = fake.log.length
day = await q.getDaysData('2026-10-08')
const asked = fake.log.slice(before).map((r) => r.path)
check('days: a skipped day shows the run and its neighbours', day.run.status === 'skipped' && day.prevDate === '2026-10-07' && day.nextDate === '2026-10-09')
check('days: a skipped day does not fetch candidates, headlines, verdicts or plans', !asked.some((p) => /candidates|headlines|verdicts|plans/.test(p)), asked.join())
day = await q.getDaysData('2026-10-06')
check('days: a date with no record gives run = null and finds the next day', day.run === null && day.nextDate === '2026-10-07' && day.prevDate === null)
check('days: the date filter reaches the server as a filter', fake.log.some((r) => r.path.endsWith('public_candidates') && r.search.includes('market_date=eq.2026-10-09')))

fake.state.empty.add('public_runs')
day = await q.getDaysData(null)
check('days: no runs at all gives date = null', day.date === null && day.candidates.length === 0)
fake.state.empty.delete('public_runs')

check('blog: no published posts is an empty list', (await q.getBlogPosts()).length === 0)
fake.state.failing.add('public_blog_posts')
check('blog: an error there just means no posts', (await q.getBlogPosts()).length === 0)
fake.state.failing.delete('public_blog_posts')

fake.state.failing.add('public_trades')
error = await rejection(q.getOverviewData())
check('errors: a failed read throws', error !== null)
check('errors: the server\'s message never travels with the error', error && error.message === 'query failed' && !JSON.stringify(error).includes('SECRET') && !String(error.stack).includes('SECRET'), error && error.message)
check('errors: only the code and view name are kept', error?.code === 'XX000' && error?.view === 'public_trades')
fake.state.failing.delete('public_trades')

console.log('\n-- security: what the dashboard asked the server for')
check('every request went to a public_* view', fake.log.every((r) => /^\/rest\/v1\/public_[a-z_]+$/.test(r.path)), [...new Set(fake.log.map((r) => r.path))].join())
check('every request used the publishable key and nothing else', fake.log.every((r) => r.apikey === KEY && r.authorization === `Bearer ${KEY}`))
const viewsUsed = new Set(fake.log.map((r) => r.path.split('/').pop()))
check('all seven views were exercised', ['public_runs', 'public_daily_equity', 'public_trades', 'public_candidates', 'public_headlines', 'public_verdicts', 'public_plans'].every((v) => viewsUsed.has(v)), [...viewsUsed].join())

// ------------------------------------------------------------------ demo mode
console.log('\n-- demo mode')
process.env.DASHBOARD_DEMO = '1'
const askedBefore = fake.log.length
const demoOverview = await q.getOverviewData()
const demoDay = await q.getDaysData(null)
const lastDemoRun = demo.runs[demo.runs.length - 1]
check('demo mode never calls Supabase', fake.log.length === askedBefore)
check('demo overview and newest day work', demoOverview.equity.length === demo.equity.length && demoDay.date === lastDemoRun.market_date)
check('demo day has neighbours', demoDay.prevDate !== null && demoDay.nextDate === null)
delete process.env.DASHBOARD_DEMO

await fake.close()
console.log(failed.length ? `\nFAILED: ${failed.join(' | ')}` : '\nALL CHECKS PASSED')
process.exit(failed.length ? 1 : 0)
