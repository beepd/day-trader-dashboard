import Script from 'next/script'

// Google Analytics 4. Switched on only when NEXT_PUBLIC_GA_ID is set (for example G-ABC123XYZ9),
// so local development and preview builds send nothing unless you add the ID there too.
// NEXT_PUBLIC_ values are baked in when the site is built, so after changing it in Vercel, redeploy.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Accept only a real-looking measurement ID, because the value is placed into the page
const looksValid = typeof GA_ID === 'string' && /^G-[A-Z0-9]{6,}$/.test(GA_ID)

export default function Analytics() {
  if (!looksValid) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
