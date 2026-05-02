'use client'

export default function Panel({ title, badge, badgeStyle, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 2 }}>{title}</div>
        {badge && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 8px', borderRadius: 2, letterSpacing: 1, ...badgeStyle }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export function Empty({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, gap: 8 }}>
      <div style={{ fontSize: 28, opacity: 0.3 }}>◻</div>
      {message}
    </div>
  )
}
