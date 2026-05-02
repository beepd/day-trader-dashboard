'use client'

import Script from 'next/script'

export default function ChartLoader() {
  return (
    <Script
      src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"
      strategy="beforeInteractive"
    />
  )
}