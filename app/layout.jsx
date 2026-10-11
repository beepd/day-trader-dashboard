import './globals.css'
import ChartLoader from '../components/ChartLoader'
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../lib/site'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' }, // trader.niftyexperiment.com shows the same site; search engines should treat the main address as the real one
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION, type: 'website', url: SITE_URL },
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
