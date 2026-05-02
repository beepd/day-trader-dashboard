'use client'

import { useEffect, useRef } from 'react'
import Panel from './Panel'
import { deriveDayPnl, fmtPnl } from '../lib/utils'

function LineChart({ balHistory }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current || !balHistory.length) return
    let Chart = window.Chart
    if (!Chart) return

    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: balHistory.map((d) => d.date),
        datasets: [{
          data: balHistory.map((d) => parseFloat(d.balance_amount)),
          borderColor: '#00d97e',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#00d97e',
          fill: true,
          backgroundColor: 'rgba(0,217,126,0.06)',
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#4a6080', font: { family: 'IBM Plex Mono', size: 9 }, maxTicksLimit: 6 }, grid: { color: '#0f2040' } },
          y: { ticks: { color: '#4a6080', font: { family: 'IBM Plex Mono', size: 9 }, callback: (v) => '₹' + Math.round(v / 1000) + 'k' }, grid: { color: '#0f2040' } },
        },
      },
    })
    return () => chartRef.current?.destroy()
  }, [balHistory])

  return (
    <div style={{ padding: '0 16px 16px', position: 'relative', height: 200 }}>
      <canvas ref={ref} role="img" aria-label="Balance over time equity curve">Balance history</canvas>
    </div>
  )
}

function BarChart({ balHistory }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current || !balHistory.length) return
    let Chart = window.Chart
    if (!Chart) return

    const pnlData = deriveDayPnl(balHistory)
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: pnlData.map((d) => d.date),
        datasets: [{
          data: pnlData.map((d) => d.pnl),
          backgroundColor: pnlData.map((d) => d.pnl >= 0 ? 'rgba(0,217,126,0.7)' : 'rgba(255,64,96,0.7)'),
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#4a6080', font: { family: 'IBM Plex Mono', size: 9 }, maxTicksLimit: 8, autoSkip: true }, grid: { color: '#0f2040' } },
          y: { ticks: { color: '#4a6080', font: { family: 'IBM Plex Mono', size: 9 }, callback: (v) => fmtPnl(v) }, grid: { color: '#0f2040' } },
        },
      },
    })
    return () => chartRef.current?.destroy()
  }, [balHistory])

  return (
    <div style={{ padding: '0 16px 16px', position: 'relative', height: 200 }}>
      <canvas ref={ref} role="img" aria-label="Daily P&L bar chart">P&L history</canvas>
    </div>
  )
}

export default function Charts({ balHistory }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Panel
        title="BALANCE HISTORY"
        badge="EQUITY CURVE"
        badgeStyle={{ background: 'var(--green-s)', color: 'var(--green)', border: '1px solid var(--green-g)' }}
      >
        <LineChart balHistory={balHistory} />
      </Panel>
      <Panel
        title="P&L HISTORY"
        badge="DAILY RETURNS"
        badgeStyle={{ background: 'var(--amber-s)', color: 'var(--amber)', border: '1px solid rgba(255,179,0,0.2)' }}
      >
        <BarChart balHistory={balHistory} />
      </Panel>
    </div>
  )
}
