import SignUpPage from '../../components/SignUpPage'
import { redirectIfAuthenticated } from '../../lib/server/pageAuth'

export default async function RegisterRoute() {
  await redirectIfAuthenticated()
  return <SignUpPage />
}
