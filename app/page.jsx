import { getAllDashboardData } from '../lib/queries'
import { todayISO } from '../lib/utils'
import Dashboard from '../components/Dashboard'

export const revalidate = 900 // revalidate every 15 minutes

export default async function Home({ searchParams }) {
  const date = searchParams?.date || todayISO()
  const data = await getAllDashboardData(date)

  return <Dashboard initialData={data} initialDate={date} />
}
