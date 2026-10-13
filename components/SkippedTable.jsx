import Panel, { Empty } from './Panel'
import Badge from './Badge'
import { fmtPct } from '../lib/utils'
import { WHATIF_LABELS } from '../lib/metrics'

const COL = '120px 84px 84px 84px 110px minmax(240px, 1fr)'
const head = { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }
const colour = (v) => (v === null ? 'var(--muted)' : v > 0 ? 'var(--green)' : v < 0 ? 'var(--red)' : 'var(--text)')

/**
 * The stocks the app looked at but did not trade, and how they actually did, best mover first.
 * `skipped` comes from skippedStocks(). Shown only once the day's outcomes exist (after the close).
 */
export default function SkippedTable({ skipped }) {
  const { rows, rose } = skipped
  return (
    <Panel
      title="STOCKS THE APP SKIPPED, AND HOW THEY DID"
      badge={rows.length ? `${rose} OF ${rows.length} ROSE` : undefined}
      badgeStyle={{ background: 'var(--amber-s)', color: 'var(--amber)', border: '1px solid rgba(255,179,0,0.2)' }}
    >
      {!rows.length ? (
        <Empty message="NO SKIPPED STOCKS TO SHOW FOR THIS DAY" />
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 820 }}>
              <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)', ...head }}>
                <span>STOCK</span><span>MOVE</span><span>HIGH</span><span>LOW</span><span>WHAT-IF TRADE</span><span>WHY IT WAS SKIPPED</span>
              </div>
              {rows.map((r) => {
                const whatIf = WHATIF_LABELS[r.whatIfOutcome]
                return (
                  <div key={r.symbol} style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontSize: 11 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--cyan)' }}>{r.symbol}</div>
                    <div style={{ fontFamily: 'var(--mono)', color: colour(r.returnPct) }}>{fmtPct(r.returnPct)}</div>
                    <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{fmtPct(r.maxUpPct)}</div>
                    <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{fmtPct(r.maxDownPct)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {whatIf ? <Badge tone={whatIf[1]}>{whatIf[0]}</Badge> : <span style={{ color: 'var(--muted)' }}>—</span>}
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: colour(r.whatIfReturnPct) }}>{r.whatIfReturnPct === null ? '' : fmtPct(r.whatIfReturnPct)}</span>
                    </div>
                    <div style={{ color: 'var(--text)', opacity: 0.8, lineHeight: 1.5 }}>{r.why}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ padding: '10px 16px', fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
            MOVE is the change from the morning price to the last price before the 3:15 PM square-off. HIGH and LOW are the best and worst points reached on the way.
            WHAT-IF TRADE shows how a fixed trade would have ended (stop 40% of the typical daily range below, target one full range above). These stocks were not traded, so none of this is in the profit or loss.
            Simulation with fake money, gross of costs. Not investment advice.
          </div>
        </>
      )}
    </Panel>
  )
}
