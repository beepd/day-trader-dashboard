import DateBar from './DateBar'
import MetricCard from './MetricCard'
import Panel, { Empty } from './Panel'
import CandidateList from './CandidateList'
import { dayStats } from '../lib/metrics'
import { fmtPnl, getMarketClosedInfo, longDate } from '../lib/utils'

export default function DayTab({ data }) {
  const { date, run, equityRow, prevDate, nextDate, candidates, headlines, verdicts, plans } = data

  if (!date) {
    return (
      <Panel title="DAY BY DAY">
        <Empty message="NO DAYS TO SHOW YET. A DAY APPEARS AFTER 3:35 PM IST ON A TRADING DAY" />
      </Panel>
    )
  }

  const bar = <DateBar date={date} marketClosed={getMarketClosedInfo(date, run)} prevDate={prevDate} nextDate={nextDate} />

  if (!run) {
    return (
      <>
        {bar}
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
