import LoginPage from '../../components/LoginPage'
import { redirectIfAuthenticated } from '../../lib/server/pageAuth'

export default async function LoginRoute() {
  await redirectIfAuthenticated()
  return <LoginPage />
}
