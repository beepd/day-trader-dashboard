// The calculations behind the screens: data in, numbers out. Ported from the Streamlit dashboard's metrics.py.
import { num } from './utils.js'

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
