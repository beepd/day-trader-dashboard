import Panel from './Panel'
import Badge from './Badge'
import { fmt, fmtPnl, fmtPct, num, prettify, safeUrl } from '../lib/utils'
import { OUTCOME_LABELS, verdictLabel } from '../lib/metrics'

const small = { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 4 }

function group(rows, sortKey) {
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.symbol)) map.set(row.symbol, [])
    map.get(row.symbol).push(row)
  }
  if (sortKey) for (const list of map.values()) list.sort((a, b) => (num(a[sortKey]) ?? 0) - (num(b[sortKey]) ?? 0))
  return map
}

function PlanLine({ plan }) {
  if (plan.status !== 'accepted') {
    return (
      <div style={{ fontSize: 11, color: 'var(--text)', opacity: 0.8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>PLAN {String(plan.status || '').toUpperCase()}: </span>
        {plan.rejection_reason || ''}
      </div>
    )
  }
  const pnl = num(plan.pnl)
  return (
    <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.7 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>PLAN: </span>
      buy {num(plan.shares) ?? '—'} at {fmt(plan.entry)}, stop {fmt(plan.stop)}, target {fmt(plan.target)}.{' '}
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>RESULT: </span>
      {plan.outcome === null || plan.outcome === undefined ? 'settlement pending' : (
        <>
          {OUTCOME_LABELS[plan.outcome] || prettify(plan.outcome)}, profit/loss{' '}
          <span style={{ fontFamily: 'var(--mono)', color: pnl === null ? 'var(--muted)' : pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtPnl(pnl)}</span>
        </>
      )}
    </div>
  )
}

/** One expandable row per stock the screener found: what the model decided and why, the headlines it saw, and the plan. */
export default function CandidateList({ candidates, headlines, verdicts, plans }) {
  const verdictOf = group(verdicts)
  const headlinesOf = group(headlines, 'position')
  const planOf = group(plans)
  const ordered = [...candidates].sort((a, b) => (num(a.rank) ?? 0) - (num(b.rank) ?? 0))

  return (
    <Panel
      title="WHAT THE APP LOOKED AT, AND WHY IT DID OR DID NOT ACT"
      badge={`${ordered.length} STOCK${ordered.length !== 1 ? 'S' : ''}`}
      badgeStyle={{ background: 'var(--cyan-s)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' }}
    >
      {ordered.map((c) => {
        const verdict = verdictOf.get(c.symbol)?.[0] || null
        const stockHeadlines = headlinesOf.get(c.symbol) || []
        const plan = planOf.get(c.symbol)?.[0] || null
        const label = verdictLabel(verdict)
        const change = num(c.change_pct)
        const volume = num(c.rel_volume)
        const cited = Array.isArray(verdict?.cited_positions) ? verdict.cited_positions : []
        const hasChecklist = verdict && (verdict.event_status || verdict.has_number !== null && verdict.has_number !== undefined || verdict.checklist_notes)

        return (
          <details key={c.symbol} style={{ borderBottom: '1px solid var(--faint)' }}>
            <summary style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px' }}>
              <span className="chev" aria-hidden="true" style={{ color: 'var(--muted)', fontSize: 10, transition: 'transform 0.15s' }}>▶</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--faint)', minWidth: 28 }}>{String(c.rank ?? '').padStart(2, '0')}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--cyan)', minWidth: 90 }}>{c.symbol}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: change !== null && change < 0 ? 'var(--red)' : 'var(--green)' }}>{fmtPct(change)}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>VOL ×{volume === null ? '—' : volume.toFixed(1)}</span>
              <span style={{ marginLeft: 'auto' }}><Badge tone={label.tone}>{label.text}</Badge></span>
            </summary>

            <div style={{ padding: '4px 16px 16px 54px', display: 'grid', gap: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                PRICE {fmt(c.price)} · TYPICAL DAILY RANGE {fmt(c.avg_range)}
              </div>

              {verdict && (
                <div>
                  <div style={small}>THE MODEL&apos;S VERDICT</div>
                  <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.6 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)' }}>
                      {prettify(verdict.catalyst_type)}{verdict.strength ? `, ${verdict.strength}` : ''}
                    </span>
                    {' '}— <span style={{ opacity: 0.8 }}>{verdict.reason}</span>
                  </div>
                  {hasChecklist && (
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>
                      {verdict.event_status ? <>event: {prettify(verdict.event_status)}</> : null}
                      {verdict.has_number !== null && verdict.has_number !== undefined ? <> · figure in a headline: {verdict.has_number ? 'yes' : 'no'}</> : null}
                      {verdict.checklist_notes ? <><br />{verdict.checklist_notes}</> : null}
                    </div>
                  )}
                  {verdict.overruled_by_code && (
                    <div style={{ fontSize: 10, color: 'var(--amber)', marginTop: 4, fontStyle: 'italic' }}>
                      The model&apos;s answer was overruled by a safety check in the code.
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={small}>HEADLINES IT WAS SHOWN</div>
                {stockHeadlines.length ? (
                  <ol style={{ listStyle: 'none', display: 'grid', gap: 4 }}>
                    {stockHeadlines.map((h, i) => {
                      const url = safeUrl(h.url)
                      const isCited = cited.includes(num(h.position))
                      return (
                        <li key={`${h.position}-${i}`} style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.5 }}>
                          <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{h.position}. </span>
                          {url ? <a href={url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--cyan)' }}>{h.title}</a> : h.title}
                          {h.source ? <span style={{ color: 'var(--muted)' }}> — {h.source}</span> : null}
                          {isCited ? <> <Badge tone="green">CITED</Badge></> : null}
                        </li>
                      )
                    })}
                  </ol>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>No headlines were found.</div>
                )}
              </div>

              {plan && <PlanLine plan={plan} />}
            </div>
          </details>
        )
      })}
    </Panel>
  )
}
