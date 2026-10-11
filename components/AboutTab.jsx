import Panel from './Panel'
import { SITE_NAME } from '../lib/site'

const heading = { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: 2, margin: '20px 0 8px' }
const text = { fontSize: 12, color: 'var(--text)', opacity: 0.85, lineHeight: 1.7 }
const list = { paddingLeft: 20, display: 'grid', gap: 6 }

const STEPS = [
  ['Check the market.', 'The app only runs on a trading day, at about 9:35 AM India time.'],
  ['Screen.', 'Out of the Nifty 100, it keeps stocks that are up at least 0.5% with higher than normal volume.'],
  ['Read the news.', 'For the top movers it collects recent headlines.'],
  ['Judge.', 'An AI model decides whether each headline shows a real, fresh reason for the move. Plain code double-checks its answers.'],
  ['Plan.', 'For stocks with a strong reason, the AI proposes a stop-loss and a target. A rulebook in code rejects plans that are too risky.'],
  ['Settle.', 'After the close, 5-minute prices show whether each trade hit its target, its stop-loss, or neither.'],
]

const LIMITS = [
  ['It is a simulation.', 'No real orders are placed and no real money is involved.'],
  ['Costs are ignored.', 'Brokerage, taxes and slippage would reduce real results.'],
  ['Data can be wrong.', 'Prices and news come from free, unofficial sources that can be late or wrong.'],
  ['Luck can look like skill.', 'A few weeks of results prove nothing.'],
  ['Not advice.', 'Nothing here is investment advice. Please do not trade based on this page.'],
]

export default function AboutTab() {
  return (
    <Panel title="ABOUT">
      <div style={{ padding: '4px 16px 20px' }}>
        <div style={heading}>WHAT IS THIS?</div>
        <p style={text}>
          <strong>{SITE_NAME}</strong> is an experiment: an AI agent tries to trade Indian stocks <strong>with fake money</strong>,
          every trading day, with no human in the loop. Everything it does is recorded and shown here.
        </p>

        <div style={heading}>HOW A DAY WORKS</div>
        <ol style={{ ...list, ...text }}>
          {STEPS.map(([lead, rest]) => (
            <li key={lead}><strong>{lead}</strong> {rest}</li>
          ))}
        </ol>

        <div style={heading}>LIMITS YOU SHOULD KNOW ABOUT</div>
        <ul style={{ ...list, ...text }}>
          {LIMITS.map(([lead, rest]) => (
            <li key={lead}><strong>{lead}</strong> {rest}</li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}
