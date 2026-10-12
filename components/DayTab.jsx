import DateBar from './DateBar'
import MetricCard from './MetricCard'
import Panel, { Empty } from './Panel'
import CandidateList from './CandidateList'
import { dayStats } from '../lib/metrics'
import { fmtPnl, getMarketClosedInfo, longDate, todayISO, isWeekendIST } from '../lib/utils'

export default function DayTab({ data }) {
  const { date, run, equityRow, prevDate, nextDate, candidates, headlines, verdicts, plans } = data

  if (!date) {
    return (
      <Panel title="DAY BY DAY">
        <Empty message="NO DAYS TO SHOW YET. A DAY APPEARS ONCE THE MORNING RUN HAS FINISHED, ON A TRADING DAY" />
      </Panel>
    )
  }

  // A day's picks are published once its morning run has finished (about 9:40 AM IST); its results (profit/loss) only after
  // the close. So if the newest published day is not today, today's run has not finished yet: say so, so an older
  // "latest day" is not mistaken for a fault.
  const today = todayISO()
  const noteStyle = { marginBottom: 12, padding: '10px 14px', border: '1px solid var(--border-b)', borderRadius: 3, background: 'var(--cyan-s)', fontSize: 11, lineHeight: 1.6, color: 'var(--text)' }
  const showingLatest = nextDate === null && date < today && !isWeekendIST(today)
  const todayNote = showingLatest ? (
    <div role="note" style={noteStyle}>
      {`Today (${longDate(today)}) is not published yet. A day's picks appear once the morning run has finished (about 9:40 AM IST), and its results after the market closes (3:35 PM IST). This is the latest published day.`}
    </div>
  ) : null
  const resultsPending = date === today && run?.status === 'finished' && !equityRow
  const pendingNote = resultsPending ? (
    <div role="note" style={noteStyle}>
      {"Today's picks are live. The results (profit or loss) are added after the market closes, from about 3:40 PM IST."}
    </div>
  ) : null

  const bar = <DateBar date={date} marketClosed={getMarketClosedInfo(date, run)} prevDate={prevDate} nextDate={nextDate} />

  if (!run) {
    return (
      <>
        {bar}
        {todayNote}
        <Panel title={longDate(date).toUpperCase()}>
          <Empty message="NOTHING PUBLISHED FOR THIS DATE. A DAY APPEARS ONCE THE MORNING RUN HAS FINISHED, ON A TRADING DAY" />
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
      {pendingNote}
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
