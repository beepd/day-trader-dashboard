'use client'

export default function MetricCard({ label, value, sub, accent, valueColor }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 3,
      padding: '14px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent || 'var(--border-b)',
      }} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 500, color: valueColor || 'var(--text)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  )
}
