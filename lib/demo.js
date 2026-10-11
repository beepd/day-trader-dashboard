// Made-up data so the layout can be previewed before real results exist (DASHBOARD_DEMO=1).
// Same shapes as the public_* views. The same seed always gives the same data. The days always end yesterday.
import { todayISO } from './utils.js'

const SYMBOLS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ITC', 'BAJFINANCE', 'WIPRO', 'PNB', 'ABB', 'CGPOWER',
  'SBILIFE', 'POWERINDIA', 'MAXHEALTH', 'ADANIENSOL', 'CUMMINSIND', 'ENRIN']
const NEWS_TYPES = ['earnings', 'order_win', 'broker_target', 'sector_or_market_move', 'dividend', 'block_deal']

// A tiny seeded random number generator (mulberry32), so the demo never changes between reloads.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo)) // hi is exclusive
const pick = (rng, list) => list[Math.floor(rng() * list.length)]
const normal = (rng, mean, sd) => mean + sd * Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng())
const r2 = (x) => Math.round(x * 100) / 100

function shuffle(rng, list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function lastTradingDays(n) {
  const out = []
  const d = new Date(todayISO() + 'T00:00:00Z')
  while (out.length < n) {
    d.setUTCDate(d.getUTCDate() - 1)
    const weekday = d.getUTCDay()
    if (weekday !== 0 && weekday !== 6) out.push(d.toISOString().slice(0, 10))
  }
  return out.reverse()
}

function buildDemo() {
  const rng = mulberry32(7)
  const equity = []
  const trades = []
  const runs = []
  const details = {}
  let balance = 100000

  for (const day of lastTradingDays(40)) {
    if (rng() < 0.07) {
      runs.push({ market_date: day, status: 'skipped', note: 'market holiday (demo)', passed_screen: null, universe_size: null })
      continue
    }

    const names = shuffle(rng, SYMBOLS).slice(0, int(rng, 4, 9))
    const strongCount = Math.min(int(rng, 0, 4), names.length)
    const tradeCount = strongCount ? int(rng, 0, strongCount + 1) : 0
    const candidates = []
    const headlines = []
    const verdicts = []
    const plans = []
    let dayPnl = 0
    let used = 0

    names.forEach((symbol, i) => {
      const price = int(rng, 300, 5000)
      candidates.push({
        market_date: day, run_id: 0, symbol, rank: i + 1, price,
        change_pct: r2(0.6 + rng() * 3.9), rel_volume: r2(1 + rng() * 3), avg_range: r2(price * 0.02),
      })
      for (const position of [1, 2]) {
        headlines.push({
          market_date: day, run_id: 0, symbol, position, source: 'Example News',
          title: `[demo] ${symbol} headline number ${position}`, published_at: null, url: 'https://example.com/demo',
        })
      }

      const strong = i < strongCount
      const weakCatalyst = !strong && i === strongCount && rng() < 0.5
      const catalystType = strong || weakCatalyst ? pick(rng, NEWS_TYPES) : 'other'
      verdicts.push({
        market_date: day, run_id: 0, symbol,
        has_catalyst: strong || weakCatalyst, bullish: strong || weakCatalyst,
        strength: strong ? 'strong' : 'weak', catalyst_type: catalystType,
        reason: strong ? 'Made-up reason for the demo: a fresh, concrete announcement.' : weakCatalyst ? 'Made-up reason for the demo: the news is vague.' : 'Headlines are generic.',
        cited_positions: strong ? [1] : [], overruled_by_code: false, on_watchlist: strong,
        event_status: strong ? 'happened' : weakCatalyst ? 'expected' : null,
        has_number: strong ? true : weakCatalyst ? false : null,
        checklist_notes: weakCatalyst ? 'Expected event and no figure in the headline, so not strong.' : null,
      })

      if (!strong) return
      const accepted = i < tradeCount
      const shares = Math.max(1, Math.floor(25000 / price))
      const stop = r2(price * 0.99)
      const target = r2(price * 1.015)
      const plan = {
        market_date: day, run_id: 0, symbol, status: accepted ? 'accepted' : 'skipped',
        rejection_reason: accepted ? null : 'already have 2 positions',
        entry: price, stop, target, shares, cost: price * shares,
        max_loss: r2((price - stop) * shares), max_gain: r2((target - price) * shares), gemini_reason: 'Demo plan.',
        outcome: null, exit_price: null, exit_time: null, pnl: null,
      }
      if (accepted) {
        const x = rng()
        const outcome = x < 0.4 ? 'target_hit' : x < 0.75 ? 'stop_hit' : 'closed_at_end'
        const exit = outcome === 'target_hit' ? target : outcome === 'stop_hit' ? stop : r2(price * (1 + normal(rng, 0, 0.004)))
        Object.assign(plan, { outcome, exit_price: exit, pnl: r2((exit - price) * shares) })
        dayPnl += plan.pnl
        used += plan.cost
        trades.push({
          market_date: day, symbol, catalyst_type: catalystType, entry: price, stop, target, shares, cost: plan.cost,
          outcome, exit_price: exit, exit_time: null, pnl: plan.pnl,
        })
      }
      plans.push(plan)
    })

    const pnl = r2(dayPnl)
    const end = r2(balance + pnl)
    equity.push({
      market_date: day, starting_balance: balance, ending_balance: end, pnl, trades: tradeCount,
      benchmark_pct: r2(normal(rng, 0.05, 0.5)), capital_used: used,
    })
    balance = end
    runs.push({ market_date: day, status: 'finished', note: null, passed_screen: names.length, universe_size: 100 })
    details[day] = { candidates, headlines, verdicts, plans }
  }

  trades.sort((a, b) => (a.market_date < b.market_date ? 1 : a.market_date > b.market_date ? -1 : 0))
  return { equity, trades, runs, details }
}

let cache = null
export function getDemo() {
  if (!cache) cache = buildDemo()
  return cache
}
