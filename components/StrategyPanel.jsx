'use client'

import Panel, { Empty } from './Panel'
import { fmt } from '../lib/utils'

const COL = '90px 1fr 90px 90px 80px 50px 60px'

export default function StrategyPanel({ strategy }) {
  return (
    <Panel
      title="STRATEGY PLANS"
      badge={`${strategy.length} PLANS`}
      badgeStyle={{ background: 'var(--amber-s)', color: 'var(--amber)', border: '1px solid rgba(255,179,0,0.2)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, borderBottom: '1px solid var(--border)' }}>
        <span>SYMBOL</span><span>THESIS</span><span>ENTRY ₹</span><span>TARGET ₹</span><span>SL ₹</span><span>QTY</span><span>CONF</span>
      </div>
      {!strategy.length ? <Empty message="NO STRATEGY DATA" /> : strategy.map((s) => {
        const confColor = s.confidence === 'High' ? 'var(--green)' : 'var(--amber)'
        return (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontSize: 11 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--cyan)' }}>{s.symbol}</div>
            <div style={{ color: 'var(--muted)', fontSize: 10, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {s.trade_thesis}
            </div>
            <div style={{ fontFamily: 'var(--mono)' }}>{fmt(s.entry_price)}</div>
            <div style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(s.target_price)}</div>
            <div style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>{fmt(s.stop_loss_price)}</div>
            <div style={{ fontFamily: 'var(--mono)' }}>{s.quantity || '—'}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: confColor }}>{s.confidence || '—'}</div>
          </div>
        )
      })}
    </Panel>
  )
}
