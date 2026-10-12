'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { todayISO } from '../lib/utils'

/**
 * Pick a day. PREV and NEXT jump to the neighbouring day that has a record (weekends and holidays are skipped);
 * the date box can still open any date. LATEST opens the newest published day.
 */
export default function DateBar({ date, marketClosed, prevDate, nextDate }) {
  const router = useRouter()
  const today = todayISO()

  function navigate(d) {
    router.push(`/?tab=days&date=${d}`)
  }

  // Today's picks appear after the morning run and its results after 3:35 PM India time, so keep checking (every 15 minutes) while today is open
  useEffect(() => {
    if (date !== today) return
    const timer = setInterval(() => router.refresh(), 15 * 60 * 1000)
    return () => clearInterval(timer)
  }, [date, today, router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3, flexWrap: 'wrap' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2 }}>TRADE DATE</div>
      <input
        type="date"
        value={date}
        max={today}
        aria-label="Trade date"
        onChange={(e) => e.target.value && navigate(e.target.value)}
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
        <button onClick={() => prevDate && navigate(prevDate)} disabled={!prevDate} style={{ opacity: prevDate ? 1 : 0.4 }}>← PREV</button>
        <button onClick={() => router.push('/?tab=days')} style={{ background: 'var(--cyan-s)', borderColor: 'rgba(0,229,255,0.3)', color: 'var(--cyan)' }}>LATEST</button>
        <button onClick={() => nextDate && navigate(nextDate)} disabled={!nextDate} style={{ opacity: nextDate ? 1 : 0.4 }}>NEXT →</button>
      </div>
    </div>
  )
}
