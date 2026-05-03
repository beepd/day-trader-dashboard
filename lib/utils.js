export const fmt = (n) =>
  '₹' + Math.abs(Number(n)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtPnl = (n) => {
  const v = Number(n)
  return (v >= 0 ? '+₹' : '-₹') + Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const fmtPct = (n) => {
  const v = Number(n)
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}

/** YYYY-MM-DD in the environment's local calendar (avoids UTC day skew from toISOString). */
export function toLocalDateISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = () => toLocalDateISO(new Date())

/** NSE-style calendar: weekend = Sat/Sun in Asia/Kolkata. */
export function isWeekendIST(isoDate) {
  const d = new Date(`${isoDate}T12:00:00+05:30`)
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(d)
  return wd === 'Sat' || wd === 'Sun'
}

/** Holiday row from DB takes precedence over weekend message. */
export function getMarketClosedInfo(isoDate, holiday) {
  const desc = holiday?.description?.trim()
  if (desc) {
    return { closed: true, message: `Market closed — ${desc}` }
  }
  if (isWeekendIST(isoDate)) {
    return { closed: true, message: 'Market closed (weekend)' }
  }
  return { closed: false, message: null }
}

export function deriveDayPnl(balHistory) {
  return balHistory.map((b, i) => ({
    date: b.date,
    balance: parseFloat(b.balance_amount),
    pnl: i === 0 ? 0 : parseFloat(b.balance_amount) - parseFloat(balHistory[i - 1].balance_amount),
  }))
}

export function computeMetrics(trades, todayBal, prevBal) {
  const startBal = prevBal ? parseFloat(prevBal.balance_amount) : null
  const closingBal = todayBal ? parseFloat(todayBal.balance_amount) : null
  const deployed = trades.reduce((s, t) => s + parseFloat(t.capital_deployed || 0), 0)
  const closed = trades.filter((t) => t.status === 'CLOSED')
  const totalPnl = closed.reduce((s, t) => s + parseFloat(t.profit_loss || 0), 0)
  const winners = closed.filter((t) => parseFloat(t.profit_loss || 0) > 0).length
  const winRate = closed.length > 0 ? Math.round((winners / closed.length) * 100) : null
  const pct = startBal && startBal > 0 && closed.length > 0 ? (totalPnl / startBal) * 100 : null

  return { startBal, closingBal, deployed, totalPnl, closed: closed.length, open: trades.length - closed.length, winRate, pct, total: trades.length }
}
