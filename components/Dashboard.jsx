import Tabs from './Tabs'
import Disclaimer from './Disclaimer'
import Panel, { Empty } from './Panel'
import OverviewTab from './OverviewTab'
import DayTab from './DayTab'
import TradesTable from './TradesTable'
import BlogTab from './BlogTab'
import AboutTab from './AboutTab'
import { cleanTrades } from '../lib/metrics'

/** The page frame: header, warning, tabs, and the chosen tab. Data is fetched on the server (see app/page.jsx). */
export default function Dashboard({ tab, data, failed, demo, blogUrl }) {
  let body
  if (failed) {
    // Never show the real error to the public: it can hold internal details. It is logged on the server instead.
    body = (
      <Panel title="DATA">
        <Empty message="THE DATA COULD NOT BE LOADED RIGHT NOW. PLEASE TRY AGAIN IN A FEW MINUTES" />
      </Panel>
    )
  } else if (tab === 'overview') body = <OverviewTab equity={data.equity} trades={data.trades} />
  else if (tab === 'days') body = <DayTab data={data} />
  else if (tab === 'trades') body = <TradesTable trades={cleanTrades(data.trades)} />
  else if (tab === 'blog') body = <BlogTab posts={data.posts} blogUrl={blogUrl} />
  else body = <AboutTab />

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', animation: 'pulse 1.5s infinite' }} />
          <div>
            <h1 style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 400, color: 'var(--text)', letterSpacing: 2 }}>THE DAY TRADER</h1>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, marginTop: 2 }}>AGENTIC AI · NSE INTRADAY SIMULATION</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2, padding: '5px 12px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2,
            background: demo ? 'var(--red-s)' : 'var(--green-s)',
            border: demo ? '1px solid rgba(255,64,96,0.3)' : '1px solid var(--green-g)',
            color: demo ? 'var(--red)' : 'var(--green)',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: demo ? 'var(--red)' : 'var(--green)', animation: 'pulse 1.5s infinite' }} />
          {demo ? 'DEMO DATA' : 'SIMULATION'}
        </div>
      </div>

      <Disclaimer demo={demo} />
      <Tabs active={tab} />
      {body}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--faint)', letterSpacing: 3, marginTop: 24 }}>
        AGENTIC AI · LANGGRAPH · SUPABASE · NSE · SIMULATED TRADING
      </div>
    </div>
  )
}
