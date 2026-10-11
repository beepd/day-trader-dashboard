// The small coloured label used for outcomes and verdicts. Same look as the badges the dashboard already had.
const TONES = {
  green: { background: 'var(--green-s)', color: 'var(--green)', border: '1px solid var(--green-g)' },
  red: { background: 'var(--red-s)', color: 'var(--red)', border: '1px solid rgba(255,64,96,0.2)' },
  amber: { background: 'var(--amber-s)', color: 'var(--amber)', border: '1px solid rgba(255,179,0,0.2)' },
  blue: { background: 'var(--blue-s)', color: 'var(--blue)', border: '1px solid rgba(41,121,255,0.2)' },
  cyan: { background: 'var(--cyan-s)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)' },
  muted: { background: 'var(--faint)', color: 'var(--muted)', border: '1px solid var(--border)' },
}

export default function Badge({ tone = 'muted', children }) {
  return (
    <span style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 2, letterSpacing: 1, whiteSpace: 'nowrap', ...(TONES[tone] || TONES.muted) }}>
      {children}
    </span>
  )
}
