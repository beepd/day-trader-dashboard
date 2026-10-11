import './globals.css'
import ChartLoader from '../components/ChartLoader'

const TITLE = 'The Day Trader: an AI paper-trading experiment'
const DESCRIPTION =
  'An AI agent paper-trades Indian (NSE) stocks with fake money every trading day. Every decision and result is published after the market closes. Simulation only, not investment advice.'

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Chart.js, loaded once for the whole site (beforeInteractive scripts belong in the root layout) */}
        <ChartLoader />
        {children}
      </body>
    </html>
  )
}
