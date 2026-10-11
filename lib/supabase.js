// The only place that talks to Supabase. Server-side only (the page fetches; the browser never calls Supabase).
//
// Settings (Vercel -> Settings -> Environment Variables, or .env.local):
//   SUPABASE_URL              the project address
//   SUPABASE_PUBLISHABLE_KEY  the PUBLISHABLE key, never the secret / service-role key
//   DASHBOARD_CACHE_SECONDS   optional, default 300 (5 minutes); 0 turns the cache off
//   DASHBOARD_DEMO=1          optional: show made-up sample data instead of reading Supabase
// The old names NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are still understood.
import { createClient } from '@supabase/supabase-js'

export function isDemo() {
  return ['1', 'true', 'yes'].includes((process.env.DASHBOARD_DEMO || '').trim().toLowerCase())
}

function configError(message) {
  const error = new Error(message)
  error.code = 'CONFIG'
  return error
}

/** Refuses a secret key. The public site must only ever hold a key that is safe to publish. */
export function assertPublicKey(key) {
  if (/^sb_secret_/i.test(key)) throw configError('A secret key must never be used in the dashboard')
  const parts = key.split('.')
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
      if (payload && payload.role === 'service_role') throw configError('A service-role key must never be used in the dashboard')
    } catch (error) {
      if (error.code === 'CONFIG') throw error // not a readable JWT: nothing to check
    }
  }
}

// How long Next.js may reuse an answer from Supabase. The data changes once a day, so 5 minutes is plenty fresh.
// (Next.js serves an expired answer once while it fetches a fresh one in the background, so a page can be one visit behind.)
function cacheOptions() {
  const seconds = Number.parseInt(process.env.DASHBOARD_CACHE_SECONDS ?? '300', 10)
  return Number.isFinite(seconds) && seconds > 0 ? { next: { revalidate: seconds } } : { cache: 'no-store' }
}

let client = null

export function getSupabase() {
  if (client) return client
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw configError('Supabase is not configured')
  assertPublicKey(key)
  const cache = cacheOptions()
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init = {}) => fetch(input, { ...init, ...cache }) },
  })
  return client
}
