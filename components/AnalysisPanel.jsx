'use client'

import Panel, { Empty } from './Panel'

const COL = '100px 1fr 70px 80px 80px 70px'

export default function AnalysisPanel({ analysis }) {
  return (
    <Panel
      title="ANALYSIS SCORES"
      badge={`${analysis.length} STOCKS`}
      badgeStyle={{ background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' }}
    >
      {!analysis.length ? <Empty message="NO ANALYSIS DATA" /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, borderBottom: '1px solid var(--border)' }}>
            <span>SYMBOL</span><span>COMPANY</span><span>SCORE</span><span>VOLUME</span><span>SENTIMENT</span><span>PRICE ₹</span>
          </div>
          {analysis.map((a) => {
            const sc = parseFloat(a.intraday_score || 0)
            const scoreColor = sc >= 7 ? 'var(--green)' : sc >= 5 ? 'var(--amber)' : 'var(--red)'
            const sentColor = a.sentiment === 'Bullish' ? 'var(--green)' : a.sentiment === 'Bearish' ? 'var(--red)' : 'var(--amber)'
            return (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontSize: 11 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--cyan)' }}>{a.symbol}</div>
                <div style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(a.company_name || '').split(' ').slice(0, 3).join(' ')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: scoreColor }}>{sc}/10</div>
                  <div style={{ height: 4, background: 'var(--faint)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sc * 10}%`, background: scoreColor, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{a.volume_verdict || '—'}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: sentColor }}>{a.sentiment || '—'}</div>
                <div style={{ fontFamily: 'var(--mono)' }}>₹{parseFloat(a.current_price || 0).toFixed(2)}</div>
              </div>
            )
          })}
        </>
      )}
    </Panel>
  )
}
