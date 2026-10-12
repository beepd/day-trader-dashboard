/** The always-visible warning. It sits above every tab. */
export default function Disclaimer({ demo }) {
  return (
    <>
      {demo && (
        <div role="alert" style={{ marginBottom: 12, padding: '10px 16px', background: 'var(--red-s)', border: '1px solid rgba(255,64,96,0.3)', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--red)', letterSpacing: 2 }}>
          DEMO DATA: EVERY NUMBER ON THIS PAGE IS MADE UP, TO PREVIEW THE LAYOUT
        </div>
      )}
      <div role="note" style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--amber-s)', border: '1px solid rgba(255,179,0,0.25)', borderRadius: 3 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: 2, marginBottom: 6 }}>
          ◆ SIMULATION · FAKE MONEY · NOT INVESTMENT ADVICE
        </div>
        <div style={{ fontSize: 11, color: 'var(--text)', opacity: 0.8, lineHeight: 1.6 }}>
          This is a simulation with fake money, run by an AI. Nothing here is a recommendation to buy or sell anything.
          Results are gross: they ignore brokerage, taxes and slippage, so real trading would have done worse.
          A day's picks appear after the morning run; its results are published only after the market has closed.
        </div>
      </div>
    </>
  )
}
