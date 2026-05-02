'use client'

import Panel, { Empty } from './Panel'

export default function BalanceLedger({ balHistory }) {
  const recent = [...balHistory].reverse().slice(0, 20)

  return (
    <Panel
      title="BALANCE LEDGER"
      badge={`${balHistory.length} ENTRIES`}
      badgeStyle={{ background: 'var(--green-s)', color: 'var(--green)', border: '1px solid var(--green-g)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 1fr 140px', gap: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, borderBottom: '1px solid var(--border)' }}>
        <span>DATE</span><span>DEBIT / CREDIT</span><span></span><span>BALANCE ₹</span>
      </div>
      {!recent.length ? <Empty message="NO BALANCE DATA" /> : recent.map((b, i) => {
        const dc = parseFloat(b.debit_credit || 0)
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 130px 1fr 140px', gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontFamily: 'var(--mono)', fontSize: 11 }}>
            <div style={{ color: 'var(--muted)' }}>{b.date}</div>
            <div style={{ color: dc >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {dc >= 0 ? '+' : ''}₹{Math.abs(dc).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div />
            <div style={{ color: 'var(--green)' }}>
              ₹{parseFloat(b.balance_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )
      })}
    </Panel>
  )
}
