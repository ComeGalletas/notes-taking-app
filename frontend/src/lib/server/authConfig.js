export const ACCESS_COOKIE_NAME = 'notes_access_token'
export const REFRESH_COOKIE_NAME = 'notes_refresh_token'

export const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 15
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:8000/api'

export function getCookieBaseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }
}
