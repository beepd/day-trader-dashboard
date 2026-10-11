'use client'

import { useEffect, useRef } from 'react'
import Panel, { Empty } from './Panel'
import CalendarHeatmap from './Calendar'
import { fmt, fmtPnl } from '../lib/utils'

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

const rupees = (v) => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const signedRupees = (v) => (v < 0 ? '-' : v > 0 ? '+' : '') + rupees(Math.abs(v))

/** The balance after each day. Green area = ahead of the starting capital (dashed line), red area = behind it. */
function BalanceChart({ series }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [
        {
          label: 'Ending balance', data: series.balance, borderColor: GREEN, borderWidth: 2, pointRadius: 2, pointBackgroundColor: GREEN, tension: 0.3,
          fill: { target: { value: series.start }, above: 'rgba(0,217,126,0.08)', below: 'rgba(255,64,96,0.12)' },
        },
        {
          label: 'Starting capital', data: series.labels.map(() => series.start), borderColor: '#4a6080', borderWidth: 1, borderDash: [5, 4], pointRadius: 0, fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: '#c8d8f0', boxWidth: 12, font: { family: 'IBM Plex Mono', size: 10 } } },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${fmt(c.parsed.y)}`,
            footer: (items) => `Day profit/loss: ${fmtPnl(series.pnl[items[0].dataIndex])}`,
          },
        },
      },
      scales: {
        x: { ticks: { ...TICK, maxTicksLimit: 6 }, grid: GRID },
        y: { ticks: { ...TICK, callback: (v) => rupees(v) }, grid: GRID },
      },
    },
  }), [series])
  return <Frame height={240} label="Account balance after each trading day, compared with the starting capital" canvasRef={ref} />
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

/** How far below the highest balance ever reached the account is, day by day. 0% = at a new high. */
function DrawdownChart({ series }) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [{
        label: 'Below the peak', data: series.drawdown, borderColor: RED, borderWidth: 2, pointRadius: 2, pointBackgroundColor: RED, tension: 0,
        fill: { target: { value: 0 }, below: 'rgba(255,64,96,0.14)' },
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => (c.parsed.y === 0 ? 'At a new high' : `${c.parsed.y.toFixed(2)}% below the peak`) } } },
      scales: {
        x: { ticks: { ...TICK, maxTicksLimit: 6 }, grid: GRID },
        y: { max: 0, suggestedMin: Math.min(series.worst * 1.15, -1), ticks: { ...TICK, callback: (v) => v.toFixed(1) + '%' }, grid: GRID },
      },
    },
  }), [series])
  return <Frame height={180} label="How far the balance is below its highest level so far, after each trading day" canvasRef={ref} />
}

/** Total profit or loss for each kind of news the trades were based on. */
function NewsTypeChart({ stats }) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels: stats.map((s) => s.label),
      datasets: [{
        data: stats.map((s) => s.total),
        backgroundColor: stats.map((s) => (s.total >= 0 ? 'rgba(0,217,126,0.7)' : 'rgba(255,64,96,0.7)')),
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `Total: ${fmtPnl(c.parsed.x)}`,
            afterLabel: (c) => {
              const s = stats[c.dataIndex]
              return [`${s.count} trade${s.count !== 1 ? 's' : ''}, ${Math.round(s.winRate)}% won`, `Average per trade: ${fmtPnl(s.avg)}`]
            },
          },
        },
      },
      scales: {
        x: { ticks: { ...TICK, callback: (v) => signedRupees(v) }, grid: GRID },
        y: { ticks: { ...TICK, color: '#c8d8f0' }, grid: { display: false } },
      },
    },
  }), [stats])
  return <Frame height={Math.max(170, stats.length * 34 + 50)} label="Total profit or loss for each kind of news" canvasRef={ref} />
}

/** From "a stock moved" to "a trade reached its target", all days added up. */
function FunnelChart({ stages }) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels: stages.map((s) => `${s.label} · ${s.n}`),
      datasets: [{
        data: stages.map((s) => s.n),
        backgroundColor: stages.map((_, i) => (i === stages.length - 1 ? 'rgba(0,217,126,0.7)' : 'rgba(41,121,255,0.7)')),
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => {
              const s = stages[c.dataIndex]
              return s.pct === null ? `${s.n}` : `${s.n} (${Math.round(s.pct)}% of the step before)`
            },
          },
        },
      },
      scales: {
        x: { beginAtZero: true, ticks: { ...TICK, precision: 0 }, grid: GRID },
        y: { ticks: { ...TICK, color: '#c8d8f0' }, grid: { display: false } },
      },
    },
  }), [stages])
  return <Frame height={220} label="How many stocks made it through each step, from moving on volume to reaching the target" canvasRef={ref} />
}

export default function Charts({ series, balance, drawdown, pnl, outcomes, newsTypes, funnel, calendar }) {
  const tradeTotal = outcomes.target_hit + outcomes.stop_hit + outcomes.closed_at_end
  const newsTrades = newsTypes.reduce((total, s) => total + s.count, 0)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Panel
        title="BALANCE OVER TIME"
        badge="ENDING BALANCE ₹"
        badgeStyle={{ background: 'var(--cyan-s)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' }}
      >
        <BalanceChart series={balance} />
        <Caption>
          The balance at the end of each trading day. The dashed line is the starting capital: green shading means ahead of
          the start, red means behind it. Gross of brokerage, taxes and slippage.
        </Caption>
      </Panel>
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
      <Panel
        title="DROP FROM THE PEAK"
        badge={`WORST ${drawdown.worst.toFixed(2)}%`}
        badgeStyle={{ background: 'var(--red-s)', color: 'var(--red)', border: '1px solid rgba(255,64,96,0.2)' }}
      >
        <DrawdownChart series={drawdown} />
        <Caption>
          How far the balance is below the highest it has ever been. 0% means a new high; a deep, long dip means a slow recovery.
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Panel
            title="RESULT BY KIND OF NEWS"
            badge={`${newsTrades} TRADE${newsTrades !== 1 ? 'S' : ''}`}
            badgeStyle={{ background: 'var(--violet-s)', color: 'var(--violet)', border: '1px solid rgba(213,0,249,0.2)' }}
          >
            {newsTypes.length ? (
              <>
                <NewsTypeChart stats={newsTypes} />
                <Caption>
                  Total profit or loss of the trades based on each kind of news. Hover a bar for the number of trades and the win rate.
                  With only a few trades per kind, one lucky trade can move a bar a lot, so read this as a hint, not a verdict.
                </Caption>
              </>
            ) : <Empty message="NO SETTLED TRADES YET" />}
          </Panel>
        </div>
        {funnel && (
          <div style={{ minWidth: 0 }}>
            <Panel
              title="FROM HEADLINE TO TRADE"
              badge="ALL DAYS ADDED UP"
              badgeStyle={{ background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' }}
            >
              {funnel[0].n ? (
                <>
                  <FunnelChart stages={funnel} />
                  <Caption>
                    Each step keeps only some of the stocks before it. It shows how picky the AI is: most movers have no real reason behind
                    the move, and not every strong one fits the risk rules or the two-position limit.
                  </Caption>
                </>
              ) : <Empty message="NO DAYS RECORDED YET" />}
            </Panel>
          </div>
        )}
      </div>
      <Panel
        title="DAY BY DAY CALENDAR"
        badge="PROFIT / LOSS"
        badgeStyle={{ background: 'var(--green-s)', color: 'var(--green)', border: '1px solid var(--green-g)' }}
      >
        <CalendarHeatmap calendar={calendar} />
        <Caption>
          One square per trading day, one column per week (Monday to Friday). Darker means a bigger result.
          {calendar.truncated ? ' Only the latest 26 weeks are shown.' : ''}
        </Caption>
      </Panel>
    </div>
  )
}
