'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { todayISO, toLocalDateISO } from '../lib/utils'

export default function DateBar({ date, marketClosed }) {
  const router = useRouter()
  const today = todayISO()
  const refreshTimer = useRef(null)

  function navigate(d) {
    router.push(`/?date=${d}`)
  }

  function prev() {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    navigate(toLocalDateISO(d))
  }

  function next() {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    const n = toLocalDateISO(d)
    if (n <= today) navigate(n)
  }

  // Auto-refresh every 15 minutes when viewing today
  useEffect(() => {
    if (date !== today) return
    refreshTimer.current = setInterval(() => router.refresh(), 15 * 60 * 1000)
    return () => clearInterval(refreshTimer.current)
  }, [date, today, router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3, flexWrap: 'wrap' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2 }}>TRADE DATE</div>
      <input
        type="date"
        value={date}
        max={today}
        onChange={(e) => navigate(e.target.value)}
      />
      {marketClosed?.closed && marketClosed.message && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--amber-s)',
            border: '1px solid rgba(255,179,0,0.25)',
            borderRadius: 2,
            padding: '4px 10px',
            fontFamily: 'var(--mono)',
            fontSize: 9,
            color: 'var(--amber)',
            letterSpacing: 1,
            maxWidth: '100%',
          }}
          title="NSE cash equity session (Mon–Fri, excluding holidays)"
        >
          <span aria-hidden="true" style={{ opacity: 0.9 }}>
            ◆
          </span>
          <span>{marketClosed.message}</span>
        </div>
      )}
      {date === today && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-s)', border: '1px solid var(--green-g)', borderRadius: 2, padding: '4px 10px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--green)', letterSpacing: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />
          AUTO-REFRESH 15 MIN
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
        <button onClick={prev}>← PREV</button>
        <button onClick={() => navigate(today)} style={{ background: 'var(--cyan-s)', borderColor: 'rgba(0,229,255,0.3)', color: 'var(--cyan)' }}>TODAY</button>
        <button onClick={next} disabled={date >= today} style={{ opacity: date >= today ? 0.4 : 1 }}>NEXT →</button>
      </div>
    </div>
  )
}
