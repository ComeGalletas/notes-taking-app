import { NextResponse } from 'next/server'

import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from './lib/server/authConfig'

const protectedPrefixes = ['/dashboard', '/notes']

export function proxy(request) {
  const pathname = request.nextUrl.pathname
  const hasAccess = Boolean(request.cookies.get(ACCESS_COOKIE_NAME)?.value)
  const hasRefresh = Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value)
  const hasAnySessionCookie = hasAccess || hasRefresh

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute && !hasAnySessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && hasAnySessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
