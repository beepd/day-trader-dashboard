// Small helpers shared by the server pages and the client components. No imports, so tests can load it directly.

const TWO = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

/** A real number, or null (blank, missing and junk values all become null). */
export function num(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export const fmt = (n) => {
  const v = num(n)
  return v === null ? '—' : '₹' + Math.abs(v).toLocaleString('en-IN', TWO)
}

export const fmtPnl = (n) => {
  const v = num(n)
  if (v === null) return '—'
  return (v >= 0 ? '+₹' : '-₹') + Math.abs(v).toLocaleString('en-IN', TWO)
}

export const fmtPct = (n) => {
  const v = num(n)
  if (v === null) return '—'
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
}

/** "news_type_name" -> "news type name" */
export const prettify = (s) => String(s ?? '').replace(/_/g, ' ')

// ---------------------------------------------------------------------------- dates (all in India time)

const IST_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })

/** Today as YYYY-MM-DD in India time. The database decides "is the day over" in India time too. */
export const todayISO = () => IST_DAY.format(new Date())

const IST_PARTS = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** Is it past 3:35 PM in India? (The database only publishes a day from then on.) `now` is a Date; tests pass a fixed one. */
export function isAfterMarketClose(now = new Date()) {
  const parts = Object.fromEntries(IST_PARTS.formatToParts(now).map((p) => [p.type, p.value]))
  return Number(parts.hour) * 60 + Number(parts.minute) >= 15 * 60 + 35
}

/** True only for a real calendar date written as YYYY-MM-DD. */
export function isValidISODate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** NSE-style calendar: weekend = Sat/Sun in Asia/Kolkata. */
export function isWeekendIST(isoDate) {
  const d = new Date(`${isoDate}T12:00:00+05:30`)
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(d)
  return wd === 'Sat' || wd === 'Sun'
}

/** "Friday, 9 October 2026" for a YYYY-MM-DD string. */
export function longDate(isoDate) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${isoDate}T00:00:00Z`))
}

/** What to tell the visitor about a day, from the official run row (if there is one). */
export function getMarketClosedInfo(isoDate, run) {
  if (run?.status === 'skipped') {
    return { closed: true, message: `App did not trade — ${String(run.note || '').trim() || 'market closed'}` }
  }
  if (run?.status === 'failed') {
    return { closed: true, message: 'The run failed on this day, so there were no trades' }
  }
  if (!run && isWeekendIST(isoDate)) {
    return { closed: true, message: 'Market closed (weekend)' }
  }
  return { closed: false, message: null }
}

// ---------------------------------------------------------------------------- safety helpers

/** Only plain web addresses become links. Anything else (javascript:, data:, ...) is dropped. */
export function safeUrl(url) {
  if (typeof url !== 'string') return null
  const s = url.trim()
  if (!/^https?:\/\//i.test(s)) return null
  try {
    new URL(s)
    return s
  } catch {
    return null
  }
}

/** One CSV cell. Text cells that start with = + - @ get a leading quote so a spreadsheet never runs them as a formula. */
export function csvCell(value, isText = false) {
  if (value === null || value === undefined) return ''
  let s = String(value)
  if (isText && /^[=+\-@\t\r]/.test(s)) s = "'" + s
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
