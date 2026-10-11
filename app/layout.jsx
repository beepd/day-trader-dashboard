import './globals.css'
import ChartLoader from '../components/ChartLoader'
import { SITE_TITLE, SITE_DESCRIPTION } from '../lib/site'

export const metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION, type: 'website' },
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
