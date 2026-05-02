'use client'

import Panel, { Empty } from './Panel'
import { fmt, fmtPnl } from '../lib/utils'

function ExitBadge({ trade }) {
  if (!trade || trade.status === 'OPEN') {
    return <span style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 2, letterSpacing: 1, background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' }}>OPEN</span>
  }
  const map = {
    TARGET:    { bg: 'var(--green-s)', color: 'var(--green)', border: '1px solid var(--green-g)', label: 'TARGET' },
    STOP_LOSS: { bg: 'var(--red-s)',   color: 'var(--red)',   border: '1px solid rgba(255,64,96,0.2)', label: 'STOP LOSS' },
    EOD_FORCE: { bg: 'var(--amber-s)', color: 'var(--amber)', border: '1px solid rgba(255,179,0,0.2)', label: 'EOD' },
  }
  const s = map[trade.exit_reason] || { bg: 'var(--faint)', color: 'var(--muted)', border: '1px solid var(--border)', label: trade.exit_reason || 'CLOSED' }
  return (
    <span style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 2, letterSpacing: 1, background: s.bg, color: s.color, border: s.border }}>
      {s.label}
    </span>
  )
}

const COL = '90px 1fr 90px 90px 90px 80px'

export default function TradesTable({ trades }) {
  return (
    <Panel
      title="EXECUTED TRADES"
      badge={`${trades.length} TRADE${trades.length !== 1 ? 'S' : ''}`}
      badgeStyle={{ background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, borderBottom: '1px solid var(--border)' }}>
        <span>SYMBOL</span><span>COMPANY</span><span>BUY ₹</span><span>SELL ₹</span><span>P&amp;L ₹</span><span>EXIT</span>
      </div>
      {!trades.length ? <Empty message="NO TRADES FOR THIS DATE" /> : trades.map((t) => {
        const pnl = t.profit_loss !== null ? parseFloat(t.profit_loss) : null
        return (
          <div key={t.trade_id} style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontSize: 11 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--cyan)' }}>{t.symbol}</div>
            <div>
              <div style={{ color: 'var(--text)' }}>{t.company_name || '—'}</div>
              <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 2 }}>{t.quantity} shares</div>
            </div>
            <div style={{ fontFamily: 'var(--mono)' }}>{fmt(t.buy_price)}</div>
            <div style={{ fontFamily: 'var(--mono)' }}>{t.actual_sell_price ? fmt(t.actual_sell_price) : '—'}</div>
            <div style={{ fontFamily: 'var(--mono)', color: pnl !== null ? (pnl >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--muted)' }}>
              {pnl !== null ? fmtPnl(pnl) : '—'}
            </div>
            <div><ExitBadge trade={t} /></div>
          </div>
        )
      })}
    </Panel>
  )
}
