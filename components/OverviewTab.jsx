import MetricCard from './MetricCard'
import Panel, { Empty } from './Panel'
import Charts from './Charts'
import {
  cleanEquity, cleanTrades, computeMetrics, comparisonSeries, balanceSeries, drawdownSeries, newsTypeStats, funnelStages, calendarWeeks, outcomeCounts,
} from '../lib/metrics'
import { fmt, fmtPnl, fmtPct } from '../lib/utils'

export default function OverviewTab({ equity: rawEquity, trades: rawTrades, funnel }) {
  const equity = cleanEquity(rawEquity)
  if (!equity.length) {
    return (
      <Panel title="OVERVIEW">
        <Empty message="NO TRADING DAYS SETTLED YET. THE FIRST RESULTS APPEAR AFTER THE MARKET CLOSES ON THE FIRST TRADING DAY" />
      </Panel>
    )
  }

  const trades = cleanTrades(rawTrades)
  const m = computeMetrics(equity, trades)
  const up = m.balance >= m.start
  const outcomes = outcomeCounts(trades)
  const winColor = m.winRate === null ? undefined : m.winRate >= 60 ? 'var(--green)' : m.winRate >= 40 ? 'var(--amber)' : 'var(--red)'

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        <MetricCard label="STARTING CAPITAL" value={fmt(m.start)} accent="var(--cyan)" />
        <MetricCard label="CURRENT BALANCE" value={fmt(m.balance)} sub={`${fmtPnl(m.totalPnl)} since the start`} accent="var(--green)" valueColor={up ? 'var(--green)' : 'var(--red)'} />
        <MetricCard label="TOTAL RETURN" value={fmtPct(m.returnPct)} sub={`${m.days} trading day${m.days !== 1 ? 's' : ''} settled`} accent="var(--amber)" valueColor={m.returnPct >= 0 ? 'var(--green)' : 'var(--red)'} />
        <MetricCard label="WIN RATE" value={m.winRate === null ? '—' : `${Math.round(m.winRate)}%`} sub={`${m.tradeCount} settled trade${m.tradeCount !== 1 ? 's' : ''}`} accent="var(--red)" valueColor={winColor} />
        <MetricCard label="WORST DROP FROM A PEAK" value={`${m.maxDrawdownPct.toFixed(2)}%`} sub="biggest fall below the highest balance" accent="var(--violet)" />
        <MetricCard label="TRADED DAYS" value={`${m.tradedDays} / ${m.days}`} sub={`best day ${fmtPnl(m.bestDay)}, worst ${fmtPnl(m.worstDay)}`} accent="var(--blue)" />
      </div>

      <Charts
        balance={balanceSeries(equity)}
        series={comparisonSeries(equity)}
        drawdown={drawdownSeries(equity)}
        pnl={equity.map((d) => ({ date: d.market_date, pnl: d.pnl }))}
        outcomes={outcomes}
        newsTypes={newsTypeStats(trades)}
        funnel={funnel ? funnelStages(funnel, outcomes) : null}
        calendar={calendarWeeks(equity)}
      />
    </>
  )
}
