'use client'

import Panel, { Empty } from './Panel'

export default function ResearchPanel({ research }) {
  return (
    <Panel
      title="RESEARCH SHORTLIST"
      badge={`${research.length} STOCKS`}
      badgeStyle={{ background: 'var(--cyan-s)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' }}
    >
      {!research.length ? <Empty message="NO RESEARCH DATA" /> : research.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--faint)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--faint)', minWidth: 28, paddingTop: 2 }}>
            {String(r.rank_no || '').padStart(2, '0')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)' }}>{r.symbol}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{r.company_name}</div>
            <span style={{ display: 'inline-block', fontSize: 9, padding: '2px 8px', borderRadius: 2, background: 'var(--cyan-s)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.15)', marginTop: 4, letterSpacing: 1, fontFamily: 'var(--mono)' }}>
              {r.sector}
            </span>
            <div style={{ fontSize: 11, color: 'var(--text)', opacity: 0.7, marginTop: 5, lineHeight: 1.5 }}>{r.trending_reason}</div>
          </div>
        </div>
      ))}
    </Panel>
  )
}
