import { unstable_noStore as noStore } from 'next/cache'
import { getAllDashboardData } from '../lib/queries'
import { todayISO } from '../lib/utils'
import Dashboard from '../components/Dashboard'

/** Always render from Supabase — avoids stale UI after DB changes (ISR/fetch cache). */
export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }) {
  noStore()
  const date = searchParams?.date || todayISO()
  const data = await getAllDashboardData(date)

  return <Dashboard initialData={data} initialDate={date} />
}
