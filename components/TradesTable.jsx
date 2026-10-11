'use client'

import { useMemo, useState } from 'react'
import Panel, { Empty } from './Panel'
import Badge from './Badge'
import { fmt, fmtPnl, prettify, csvCell } from '../lib/utils'
import { OUTCOME_KEYS, OUTCOME_LABELS } from '../lib/metrics'
import { CSV_FILENAME } from '../lib/site'

const COL = '86px 84px minmax(110px, 1fr) 80px 74px 74px 80px 54px 84px 96px'
const PAGE = 100
const SHORT = { target_hit: ['TARGET', 'green'], stop_hit: ['STOP LOSS', 'red'], closed_at_end: ['EOD', 'amber'] }
const CSV_HEADER = ['Date', 'Stock', 'News type', 'Bought at', 'Stop', 'Target', 'Sold at', 'Shares', 'Outcome', 'Profit/loss (₹)']
const CSV_TEXT_COLUMNS = new Set([1, 2, 8]) // stock, news type, outcome are text: protect them from spreadsheet formulas

function OutcomeBadge({ outcome }) {
  const [label, tone] = SHORT[outcome] || [prettify(outcome).toUpperCase() || 'CLOSED', 'muted']
  return <Badge tone={tone}>{label}</Badge>
}

function downloadCsv(rows) {
  const lines = [CSV_HEADER.join(',')]
  for (const t of rows) {
    const cells = [t.market_date, t.symbol, t.catalyst_type, t.entry, t.stop, t.target, t.exit_price, t.shares, OUTCOME_LABELS[t.outcome] ?? t.outcome, t.pnl]
    lines.push(cells.map((v, i) => csvCell(v, CSV_TEXT_COLUMNS.has(i))).join(','))
  }
  // The leading ﻿ lets Excel read the ₹ in the header correctly
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = CSV_FILENAME
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function TradesTable({ trades }) {
  const [picked, setPicked] = useState(OUTCOME_KEYS)
  const [limit, setLimit] = useState(PAGE)

  const shown = useMemo(
    () => trades.filter((t) => picked.includes(t.outcome) || !OUTCOME_KEYS.includes(t.outcome)),
    [trades, picked],
  )

  function toggle(key) {
    setLimit(PAGE)
    setPicked((now) => (now.includes(key) ? now.filter((k) => k !== key) : [...now, key]))
  }

  return (
    <Panel
      title="ALL TRADES"
      badge={`${shown.length} TRADE${shown.length !== 1 ? 'S' : ''}`}
      badgeStyle={{ background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' }}
    >
      {!trades.length ? <Empty message="NO SETTLED TRADES YET" /> : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '10px 16px', borderBottom: '1px solid var(--faint)' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginRight: 4 }}>OUTCOME</span>
            {OUTCOME_KEYS.map((key) => {
              const on = picked.includes(key)
              return (
                <button key={key} aria-pressed={on} onClick={() => toggle(key)}
                  style={on ? { color: 'var(--text)', borderColor: 'var(--border-b)', background: 'var(--cyan-s)' } : { opacity: 0.55 }}>
                  {OUTCOME_LABELS[key].toUpperCase()}
                </button>
              )
            })}
            <button onClick={() => downloadCsv(shown)} disabled={!shown.length}
              style={{ marginLeft: 'auto', background: 'var(--cyan-s)', borderColor: 'rgba(0,229,255,0.3)', color: 'var(--cyan)' }}>
              ↓ DOWNLOAD CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 900 }}>
              <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, padding: '8px 16px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, borderBottom: '1px solid var(--border)' }}>
                <span>DATE</span><span>STOCK</span><span>NEWS TYPE</span><span>BOUGHT ₹</span><span>STOP ₹</span><span>TARGET ₹</span><span>SOLD ₹</span><span>SHARES</span><span>OUTCOME</span><span>P&amp;L ₹</span>
              </div>
              {!shown.length ? <Empty message="NO TRADES MATCH THIS FILTER" /> : shown.slice(0, limit).map((t, i) => (
                <div key={`${t.market_date}-${t.symbol}-${i}`} style={{ display: 'grid', gridTemplateColumns: COL, gap: 8, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--faint)', fontSize: 11 }}>
                  <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{t.market_date}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--cyan)' }}>{t.symbol}</div>
                  <div style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prettify(t.catalyst_type) || '—'}</div>
                  <div style={{ fontFamily: 'var(--mono)' }}>{fmt(t.entry)}</div>
                  <div style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>{fmt(t.stop)}</div>
                  <div style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(t.target)}</div>
                  <div style={{ fontFamily: 'var(--mono)' }}>{fmt(t.exit_price)}</div>
                  <div style={{ fontFamily: 'var(--mono)' }}>{t.shares ?? '—'}</div>
                  <div><OutcomeBadge outcome={t.outcome} /></div>
                  <div style={{ fontFamily: 'var(--mono)', color: t.pnl !== null ? (t.pnl >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--muted)' }}>
                    {fmtPnl(t.pnl)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {shown.length > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 14 }}>
              <button onClick={() => setLimit((n) => n + PAGE)}>SHOW MORE ({shown.length - limit} LEFT)</button>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}
