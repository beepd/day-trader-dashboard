import './globals.css'

export const metadata = {
  title: 'The Day Trader',
  description: 'NSE Intraday Simulation Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
