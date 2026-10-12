import DateBar from './DateBar'
import MetricCard from './MetricCard'
import Panel, { Empty } from './Panel'
import CandidateList from './CandidateList'
import { dayStats } from '../lib/metrics'
import { fmtPnl, getMarketClosedInfo, longDate, todayISO, isWeekendIST, isAfterMarketClose } from '../lib/utils'

export default function DayTab({ data }) {
  const { date, run, equityRow, prevDate, nextDate, candidates, headlines, verdicts, plans } = data

  if (!date) {
    return (
      <Panel title="DAY BY DAY">
        <Empty message="NO DAYS TO SHOW YET. A DAY APPEARS AFTER 3:35 PM IST ON A TRADING DAY" />
      </Panel>
    )
  }

  // Today never appears before 3:35 PM India time (the database publishes a day only after the close). Say so, so an old
  // "latest day" is not mistaken for a fault.
  const today = todayISO()
  const showingLatest = nextDate === null && date < today && !isWeekendIST(today)
  const todayNote = showingLatest ? (
    <div role="note" style={{ marginBottom: 12, padding: '10px 14px', border: '1px solid var(--border-b)', borderRadius: 3, background: 'var(--cyan-s)', fontSize: 11, lineHeight: 1.6, color: 'var(--text)' }}>
      {isAfterMarketClose()
        ? `Today (${longDate(today)}) is not published yet. A day appears once the market has closed and its results are settled, usually a few minutes after 3:40 PM IST. This is the latest published day.`
        : `Today (${longDate(today)}) appears here after 3:35 PM IST, once the market has closed. This is the latest published day.`}
    </div>
  ) : null

  const bar = <DateBar date={date} marketClosed={getMarketClosedInfo(date, run)} prevDate={prevDate} nextDate={nextDate} />

  if (!run) {
    return (
      <>
        {bar}
        {todayNote}
        <Panel title={longDate(date).toUpperCase()}>
          <Empty message="NOTHING PUBLISHED FOR THIS DATE. A DAY APPEARS AFTER 3:35 PM IST ON A TRADING DAY" />
        </Panel>
      </>
    )
  }

  if (run.status !== 'finished') {
    return (
      <>
        {bar}
        {todayNote}
        <Panel title={longDate(date).toUpperCase()}>
          <Empty message={run.status === 'skipped' ? 'THE APP DID NOT TRADE ON THIS DAY' : 'THE RUN FAILED ON THIS DAY, SO THERE WERE NO TRADES'} />
        </Panel>
      </>
    )
  }

  const s = dayStats({ run, equityRow, candidates, verdicts, plans })
  const pnlColor = s.pnl === null ? undefined : s.pnl > 0 ? 'var(--green)' : s.pnl < 0 ? 'var(--red)' : undefined

  return (
    <>
      {bar}
      {todayNote}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2, marginBottom: 12 }}>
        {longDate(date).toUpperCase()}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        <MetricCard label="STOCKS CHECKED" value={s.checked} sub="the Nifty 100" accent="var(--cyan)" />
        <MetricCard label="MOVING" value={s.moving} sub="passed the screener" accent="var(--blue)" />
        <MetricCard label="STRONG CATALYSTS" value={s.strong} sub="news worth acting on" accent="var(--violet)" />
        <MetricCard label="TRADES" value={s.trades} sub="accepted plans" accent="var(--amber)" />
        <MetricCard label="DAY PROFIT / LOSS" value={s.pnl === null ? 'pending' : fmtPnl(s.pnl)} sub="after settlement" accent="var(--green)" valueColor={pnlColor} />
      </div>

      {candidates.length ? (
        <CandidateList candidates={candidates} headlines={headlines} verdicts={verdicts} plans={plans} />
      ) : (
        <Panel title="WHAT THE APP LOOKED AT">
          <Empty message="NOTHING WAS MOVING ENOUGH THAT DAY, SO THE APP STOPPED BEFORE LOOKING AT ANY NEWS" />
        </Panel>
      )}
    </>
  )
}
