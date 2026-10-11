'use client'

import { useState } from 'react'
import { fmtPnl, longDate } from '../lib/utils'

const CELL = 18
const GAP = 3
const LETTERS = ['M', 'T', 'W', 'T', 'F']

/** Green for a profit, red for a loss; the bigger the amount (compared with the biggest day shown), the stronger the colour. */
function shade(pnl, maxAbs) {
  const strength = maxAbs > 0 ? Math.abs(pnl) / maxAbs : 0
  const alpha = (0.25 + 0.65 * strength).toFixed(2)
  return pnl > 0 ? `rgba(0,217,126,${alpha})` : `rgba(255,64,96,${alpha})`
}

function describe(day) {
  if (!day.hasRow) return `${longDate(day.date)}: no record (holiday, or the app did not run)`
  if (!day.trades) return `${longDate(day.date)}: no trades`
  return `${longDate(day.date)}: ${fmtPnl(day.pnl)} from ${day.trades} trade${day.trades !== 1 ? 's' : ''}`
}

function Swatch({ background, border }) {
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background, border }} />
}

/** One square per trading day. Hover, tap or tab to a square to read that day's result underneath. */
export default function CalendarHeatmap({ calendar }) {
  const [picked, setPicked] = useState(null)
  const { weeks, maxAbs } = calendar

  return (
    <div style={{ padding: '14px 16px 16px' }}>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: GAP, width: 'max-content' }} role="group" aria-label="Profit or loss for each trading day, one square per day">
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 4 }} aria-hidden="true">
            <div style={{ height: 12 }} />
            {LETTERS.map((letter, i) => (
              <div key={i} style={{ height: CELL, lineHeight: `${CELL}px`, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)' }}>{letter}</div>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week.days[0].date} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              <div style={{ height: 12, width: CELL, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'visible' }}>{week.month}</div>
              {week.days.map((day) => {
                if (day.future) return <div key={day.date} style={{ width: CELL, height: CELL }} />
                const flat = !day.hasRow || !day.trades || !day.pnl
                const style = {
                  width: CELL, height: CELL, padding: 0, minWidth: 0, borderRadius: 2, cursor: 'default',
                  background: !day.hasRow ? 'transparent' : flat ? 'var(--border-b)' : shade(day.pnl, maxAbs),
                  border: !day.hasRow ? '1px dashed var(--faint)' : '1px solid transparent',
                  outlineOffset: 1,
                }
                const text = describe(day)
                return (
                  <button key={day.date} type="button" style={style} aria-label={text} title={text}
                    onMouseEnter={() => setPicked(day)} onFocus={() => setPicked(day)} onClick={() => setPicked(day)} />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div aria-live="polite" style={{ minHeight: 18, marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11, color: picked ? 'var(--text)' : 'var(--muted)' }}>
        {picked ? describe(picked) : 'Hover or tap a square to see that day.'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8, fontSize: 10, color: 'var(--muted)' }} aria-hidden="true">
        <span>LOSS</span>
        {[0.9, 0.55, 0.25].map((a) => <Swatch key={a} background={`rgba(255,64,96,${a})`} />)}
        <Swatch background="var(--border-b)" />
        {[0.25, 0.55, 0.9].map((a) => <Swatch key={a} background={`rgba(0,217,126,${a})`} />)}
        <span>PROFIT</span>
        <span style={{ marginLeft: 10 }}><Swatch background="var(--border-b)" /> no trades</span>
        <span style={{ marginLeft: 6 }}><Swatch background="transparent" border="1px dashed var(--faint)" /> no record</span>
      </div>
    </div>
  )
}
