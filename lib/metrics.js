// The calculations behind the screens: data in, numbers out. Ported from the Streamlit dashboard's metrics.py.
import { num, prettify } from './utils.js'

export const OUTCOME_LABELS = {
  target_hit: 'target reached',
  stop_hit: 'stop-loss hit',
  closed_at_end: 'closed at end of day',
}
export const OUTCOME_KEYS = Object.keys(OUTCOME_LABELS)

const byDateAsc = (a, b) => (a.market_date < b.market_date ? -1 : a.market_date > b.market_date ? 1 : 0)

/** Numbers as numbers, rows without a usable balance dropped, oldest day first. */
export function cleanEquity(rows) {
  return (rows || [])
    .map((r) => {
      const start = num(r.starting_balance)
      const end = num(r.ending_balance)
      return {
        ...r,
        starting_balance: start,
        ending_balance: end,
        pnl: num(r.pnl) ?? (start !== null && end !== null ? end - start : 0),
        trades: num(r.trades) ?? 0,
        benchmark_pct: num(r.benchmark_pct),
        capital_used: num(r.capital_used),
      }
    })
    .filter((r) => r.market_date && r.starting_balance !== null && r.ending_balance !== null)
    .sort(byDateAsc)
}

/** Numbers as numbers, newest day first. */
export function cleanTrades(rows) {
  return (rows || [])
    .map((r) => ({
      ...r,
      entry: num(r.entry),
      stop: num(r.stop),
      target: num(r.target),
      exit_price: num(r.exit_price),
      shares: num(r.shares),
      pnl: num(r.pnl),
    }))
    .sort((a, b) => byDateAsc(b, a))
}

/** Headline numbers. `equity` must be cleaned and non-empty. */
export function computeMetrics(equity, trades) {
  const start = equity[0].starting_balance
  const balance = equity[equity.length - 1].ending_balance

  // "Worst drop from a peak": keep a high-water mark that only goes up, and measure how far below it we ever fall.
  let peak = start
  let maxDrawdown = 0
  for (const day of equity) {
    peak = Math.max(peak, day.ending_balance)
    if (peak > 0) maxDrawdown = Math.max(maxDrawdown, (peak - day.ending_balance) / peak)
  }

  const settled = (trades || []).map((t) => t.pnl).filter((p) => p !== null)
  const wins = settled.filter((p) => p > 0).length
  const pnls = equity.map((d) => d.pnl)

  return {
    start,
    balance,
    totalPnl: balance - start,
    returnPct: start ? (balance / start - 1) * 100 : 0,
    days: equity.length,
    tradedDays: equity.filter((d) => d.trades > 0).length,
    tradeCount: settled.length,
    winRate: settled.length ? (wins / settled.length) * 100 : null,
    bestDay: Math.max(...pnls),
    worstDay: Math.min(...pnls),
    maxDrawdownPct: maxDrawdown * 100,
  }
}

/** Cumulative return of the strategy and of the Nifty (same time window each day), in percent. A day without a benchmark counts as 0%. */
export function comparisonSeries(equity) {
  const start = equity[0].starting_balance
  let growth = 1
  return {
    labels: equity.map((d) => d.market_date),
    strategy: equity.map((d) => (d.ending_balance / start - 1) * 100),
    nifty: equity.map((d) => {
      growth *= 1 + (d.benchmark_pct ?? 0) / 100
      return (growth - 1) * 100
    }),
  }
}

/** The balance at the end of each day, plus the starting capital as a reference line. `equity` must be cleaned and non-empty. */
export function balanceSeries(equity) {
  return {
    labels: equity.map((d) => d.market_date),
    balance: equity.map((d) => d.ending_balance),
    pnl: equity.map((d) => d.pnl),
    start: equity[0].starting_balance,
  }
}

/**
 * How far below its highest-ever level the balance is after each day, in percent (0 = at a new high, -2 = 2% below the peak).
 * Same high-water-mark idea as "worst drop from a peak". `equity` must be cleaned and non-empty.
 */
export function drawdownSeries(equity) {
  let peak = equity[0].starting_balance
  let worst = 0
  const drawdown = equity.map((d) => {
    peak = Math.max(peak, d.ending_balance)
    const pct = peak > 0 ? (d.ending_balance / peak - 1) * 100 : 0
    worst = Math.min(worst, pct)
    return pct
  })
  return { labels: equity.map((d) => d.market_date), drawdown, worst }
}

/** Results grouped by the kind of news the trade was based on. Unsettled trades are left out. Best total first. */
export function newsTypeStats(trades) {
  const groups = new Map()
  for (const t of trades || []) {
    if (t.pnl === null || t.pnl === undefined) continue
    const type = t.catalyst_type || 'unknown'
    const g = groups.get(type) || { type, label: prettify(type), count: 0, wins: 0, total: 0 }
    g.count += 1
    g.total += t.pnl
    if (t.pnl > 0) g.wins += 1
    groups.set(type, g)
  }
  return [...groups.values()]
    .map((g) => ({ ...g, winRate: (g.wins / g.count) * 100, avg: g.total / g.count }))
    .sort((a, b) => b.total - a.total)
}

/**
 * The steps from "a stock moved" to "a trade reached its target", all days added up.
 * `counts` = { screened, withReason, strong, traded } (null if unavailable), `outcomes` from outcomeCounts.
 * Each stage also carries its share of the stage before it.
 */
export function funnelStages(counts, outcomes) {
  if (!counts) return []
  const steps = [
    ['MOVED UP ON VOLUME', counts.screened],
    ['AI FOUND A REAL REASON', counts.withReason],
    ['JUDGED STRONG', counts.strong],
    ['TRADED', counts.traded],
    ['REACHED THE TARGET', outcomes.target_hit],
  ]
  return steps.map(([label, n], i) => ({ label, n, pct: i > 0 && steps[i - 1][1] > 0 ? (n / steps[i - 1][1]) * 100 : null }))
}

const DAY_MS = 86400000

/**
 * The daily P&L laid out as a calendar: one column per week, Monday to Friday. Shows at most the last `maxWeeks` weeks.
 * A day with no balance row (holiday, or the app did not run) has hasRow = false; days after the latest one are `future`.
 * `equity` must be cleaned and non-empty.
 */
export function calendarWeeks(equity, maxWeeks = 26) {
  const byDate = new Map(equity.map((d) => [d.market_date, d]))
  const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`)
  const mondayOf = (ms) => ms - ((new Date(ms).getUTCDay() + 6) % 7) * DAY_MS
  const firstMon = mondayOf(toMs(equity[0].market_date))
  const lastMs = toMs(equity[equity.length - 1].market_date)
  const lastMon = mondayOf(lastMs)
  const startMon = Math.max(firstMon, lastMon - (maxWeeks - 1) * 7 * DAY_MS)

  const weeks = []
  let maxAbs = 0
  let prevMonth = null
  for (let mon = startMon; mon <= lastMon; mon += 7 * DAY_MS) {
    const month = new Date(mon).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    const days = []
    for (let i = 0; i < 5; i++) {
      const ms = mon + i * DAY_MS
      const date = new Date(ms).toISOString().slice(0, 10)
      const row = byDate.get(date)
      if (row) maxAbs = Math.max(maxAbs, Math.abs(row.pnl))
      days.push({ date, future: ms > lastMs, hasRow: Boolean(row), pnl: row ? row.pnl : null, trades: row ? row.trades : 0 })
    }
    weeks.push({ month: month !== prevMonth ? month : '', days })
    prevMonth = month
  }
  return { weeks, maxAbs, truncated: startMon > firstMon }
}

/** How many trades ended each way. */
export function outcomeCounts(trades) {
  const counts = { target_hit: 0, stop_hit: 0, closed_at_end: 0 }
  for (const t of trades || []) if (t.outcome in counts) counts[t.outcome] += 1
  return counts
}

/** The five numbers at the top of a day. */
export function dayStats({ run, equityRow, candidates, verdicts, plans }) {
  return {
    checked: num(run?.universe_size) ?? 100,
    moving: num(run?.passed_screen) ?? candidates.length,
    strong: verdicts.filter((v) => v.on_watchlist).length,
    trades: plans.filter((p) => p.status === 'accepted').length,
    pnl: equityRow ? num(equityRow.pnl) : null,
  }
}

/** The one-line label shown on each candidate. */
export function verdictLabel(v) {
  if (!v) return { text: 'NO VERDICT', tone: 'muted' }
  if (v.on_watchlist) return { text: 'STRONG · WATCHLIST', tone: 'green' }
  if (v.has_catalyst) {
    const strength = v.strength ? ` ${String(v.strength).toUpperCase()}` : ''
    return { text: `CATALYST${strength} · NOT SELECTED`, tone: 'amber' }
  }
  return { text: 'NO REAL CATALYST', tone: 'red' }
}
