import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from './authConfig'

export async function hasAuthCookies() {
  const cookieStore = await cookies()
  const access = cookieStore.get(ACCESS_COOKIE_NAME)?.value
  const refresh = cookieStore.get(REFRESH_COOKIE_NAME)?.value
  return Boolean(access || refresh)
}

export async function requireAuthPage() {
  if (!(await hasAuthCookies())) {
    redirect('/login')
  }
}

export async function redirectIfAuthenticated() {
  if (await hasAuthCookies()) {
    redirect('/dashboard')
  }
}
