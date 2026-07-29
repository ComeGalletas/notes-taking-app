import { redirect } from 'next/navigation'

import { hasAuthCookies } from '../lib/server/pageAuth'

export default async function HomePage() {
  const authenticated = await hasAuthCookies()
  redirect(authenticated ? '/dashboard' : '/login')
}
