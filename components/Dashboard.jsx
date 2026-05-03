'use client'

import DateBar from './DateBar'
import MetricCard from './MetricCard'
import TradesTable from './TradesTable'
import ResearchPanel from './ResearchPanel'
import AnalysisPanel from './AnalysisPanel'
import StrategyPanel from './StrategyPanel'
import BalanceLedger from './BalanceLedger'
import Charts from './Charts'
import ChartLoader from './ChartLoader'
import { computeMetrics, fmt, fmtPnl, fmtPct, getMarketClosedInfo } from '../lib/utils'

/** Props come from the server on each navigation (do not copy into useState or date changes stay stale). */
export default function Dashboard({ initialData, initialDate }) {
  const { trades, research, analysis, strategy, balChart, balLedger, todayBal, prevBal, holiday } = initialData
  const m = computeMetrics(trades, todayBal, prevBal)
  const marketClosed = getMarketClosedInfo(initialDate, holiday)

  return (
    <>
      <ChartLoader />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulse 1.5s infinite' }} />
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text)', letterSpacing: 2 }}>THE DAY TRADER</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, marginTop: 2 }}>AGENTIC AI · NSE INTRADAY SIMULATION</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-s)', border: '1px solid var(--green-g)', borderRadius: 2, padding: '5px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)', letterSpacing: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />
            LIVE DATA
          </div>
        </div>

        {/* Date Bar */}
        <DateBar date={initialDate} marketClosed={marketClosed} />

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          <MetricCard label="STARTING CAPITAL" value={m.startBal !== null ? fmt(m.startBal) : '—'} accent="var(--cyan)" />
          <MetricCard label="CAPITAL DEPLOYED" value={m.deployed > 0 ? fmt(m.deployed) : '—'} accent="var(--blue)" />
          <MetricCard
            label="CLOSING BALANCE"
            value={m.closingBal !== null ? fmt(m.closingBal) : '—'}
            accent="var(--green)"
            valueColor={m.closingBal !== null && m.startBal !== null ? (m.closingBal >= m.startBal ? 'var(--green)' : 'var(--red)') : undefined}
          />
          <MetricCard
            label="DAY P&L"
            value={m.closed > 0 ? fmtPnl(m.totalPnl) : '—'}
            sub={m.pct !== null ? fmtPct(m.pct) : undefined}
            accent="var(--amber)"
            valueColor={m.totalPnl >= 0 ? 'var(--green)' : 'var(--red)'}
          />
          <MetricCard
            label="TRADES"
            value={m.total || '—'}
            sub={m.total > 0 ? `${m.closed} CLOSED · ${m.open} OPEN` : undefined}
            accent="var(--violet)"
          />
          <MetricCard
            label="WIN RATE"
            value={m.winRate !== null ? `${m.winRate}%` : '—'}
            accent="var(--red)"
            valueColor={m.winRate >= 60 ? 'var(--green)' : m.winRate >= 40 ? 'var(--amber)' : m.winRate !== null ? 'var(--red)' : undefined}
          />
        </div>

        {/* Trades */}
        <div style={{ marginBottom: 12 }}>
          <TradesTable trades={trades} />
        </div>

        {/* Research + Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <ResearchPanel research={research} />
          <AnalysisPanel analysis={analysis} />
        </div>

        {/* Strategy */}
        <div style={{ marginBottom: 12 }}>
          <StrategyPanel strategy={strategy} />
        </div>

        {/* Charts */}
        <div style={{ marginBottom: 12 }}>
          <Charts balHistory={balChart} />
        </div>

        {/* Balance Ledger */}
        <div style={{ marginBottom: 12 }}>
          <BalanceLedger balHistory={balLedger} />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--faint)', letterSpacing: 3, marginTop: 24 }}>
          AGENTIC AI · CREWAI · SUPABASE · NSE · APSCHEDULER · SIMULATED TRADING
        </div>
      </div>
    </>
  )
}
