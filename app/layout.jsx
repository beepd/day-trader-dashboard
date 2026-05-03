import './globals.css'

export const metadata = {
  title: 'The Day Trader',
  description:
    'UI for an agentic AI day-trading simulation: CrewAI pipeline writes NSE intraday runs to Supabase; this dashboard reads and visualizes them.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
