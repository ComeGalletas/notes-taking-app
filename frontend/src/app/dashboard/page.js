import DashboardPage from '../../components/DashboardPage'
import { requireAuthPage } from '../../lib/server/pageAuth'

export default async function DashboardRoute() {
  await requireAuthPage()
  return <DashboardPage />
}
