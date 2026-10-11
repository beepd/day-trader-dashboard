'use client'

import { useEffect, useRef } from 'react'
import Panel, { Empty } from './Panel'
import { fmtPnl } from '../lib/utils'

const TICK = { color: '#4a6080', font: { family: 'IBM Plex Mono', size: 9 } }
const GRID = { color: '#0f2040' }
const GREEN = '#00d97e'
const RED = '#ff4060'
const AMBER = '#ffb300'

/**
 * Chart.js arrives from a <script> tag (see ChartLoader), so it may not be ready the moment the page appears.
 * This waits for it (up to about 10 seconds), draws the chart, and cleans up when the data changes.
 */
function useChart(build, deps) {
  const ref = useRef(null)
  useEffect(() => {
    let chart = null
    let timer = null
    let cancelled = false
    let tries = 0
    function draw() {
      if (cancelled || !ref.current) return
      const Chart = window.Chart
      if (!Chart) {
        if (tries++ < 100) timer = setTimeout(draw, 100)
        return
      }
      chart = new Chart(ref.current, build())
    }
    draw()
    return () => {
      cancelled = true
      clearTimeout(timer)
      chart?.destroy()
    }
  }, deps)
  return ref
}

function Frame({ height = 200, label, canvasRef }) {
  return (
    <div style={{ padding: '0 16px 16px', position: 'relative', height }}>
      <canvas ref={canvasRef} role="img" aria-label={label}>{label}</canvas>
    </div>
  )
}

function Caption({ children }) {
  return <div style={{ padding: '0 16px 14px', fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>{children}</div>
}

function VersusChart({ series }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [
        { label: 'Strategy', data: series.strategy, borderColor: GREEN, borderWidth: 2, pointRadius: 2, pointBackgroundColor: GREEN, fill: true, backgroundColor: 'rgba(0,217,126,0.06)', tension: 0.3 },
        { label: 'Nifty, same window', data: series.nifty, borderColor: AMBER, borderWidth: 2, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: '#c8d8f0', boxWidth: 12, font: { family: 'IBM Plex Mono', size: 10 } } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y.toFixed(2)}%` } },
      },
      scales: {
        x: { ticks: { ...TICK, maxTicksLimit: 6 }, grid: GRID },
        y: { ticks: { ...TICK, callback: (v) => v.toFixed(1) + '%' }, grid: GRID },
      },
    },
  }), [series])
  return <Frame height={240} label="Cumulative return of the strategy compared with the Nifty" canvasRef={ref} />
}

function PnlChart({ pnl }) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels: pnl.map((d) => d.date),
      datasets: [{
        data: pnl.map((d) => d.pnl),
        backgroundColor: pnl.map((d) => (d.pnl >= 0 ? 'rgba(0,217,126,0.7)' : 'rgba(255,64,96,0.7)')),
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fmtPnl(c.parsed.y) } } },
      scales: {
        x: { ticks: { ...TICK, maxTicksLimit: 8, autoSkip: true }, grid: GRID },
        y: { ticks: { ...TICK, callback: (v) => fmtPnl(v) }, grid: GRID },
      },
    },
  }), [pnl])
  return <Frame label="Profit and loss per day" canvasRef={ref} />
}

function OutcomeChart({ outcomes }) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels: ['TARGET', 'STOP LOSS', 'END OF DAY'],
      datasets: [{
        data: [outcomes.target_hit, outcomes.stop_hit, outcomes.closed_at_end],
        backgroundColor: ['rgba(0,217,126,0.7)', 'rgba(255,64,96,0.7)', 'rgba(255,179,0,0.7)'],
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: TICK, grid: GRID },
        y: { beginAtZero: true, ticks: { ...TICK, precision: 0 }, grid: GRID },
      },
    },
  }), [outcomes])
  return <Frame label="How the trades ended" canvasRef={ref} />
}

export default function Charts({ series, pnl, outcomes }) {
  const tradeTotal = outcomes.target_hit + outcomes.stop_hit + outcomes.closed_at_end
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Panel
        title="STRATEGY VS THE MARKET"
        badge="CUMULATIVE RETURN %"
        badgeStyle={{ background: 'var(--green-s)', color: 'var(--green)', border: '1px solid var(--green-g)' }}
      >
        <VersusChart series={series} />
        <Caption>
          The Nifty line covers the same time window as the trades each day (from when the app bought until the 3:15 PM close).
          A day without a benchmark counts as 0%.
        </Caption>
      </Panel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Panel
            title="PROFIT / LOSS PER DAY"
            badge="DAILY RETURNS"
            badgeStyle={{ background: 'var(--amber-s)', color: 'var(--amber)', border: '1px solid rgba(255,179,0,0.2)' }}
          >
            <PnlChart pnl={pnl} />
          </Panel>
        </div>
        <div style={{ minWidth: 0 }}>
          <Panel
            title="HOW THE TRADES ENDED"
            badge={`${tradeTotal} TRADE${tradeTotal !== 1 ? 'S' : ''}`}
            badgeStyle={{ background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' }}
          >
            {tradeTotal ? <OutcomeChart outcomes={outcomes} /> : <Empty message="NO SETTLED TRADES YET" />}
          </Panel>
        </div>
      </div>
    </div>
  )
}
