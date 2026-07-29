import {
  ACCESS_COOKIE_NAME,
  BACKEND_API_BASE_URL,
  REFRESH_COOKIE_NAME,
} from '../../../../lib/server/authConfig'
import { buildProxyResponse } from '../../../../lib/server/proxyResponse'

export async function POST(request) {
  const access = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  const refresh = request.cookies.get(REFRESH_COOKIE_NAME)?.value
  const csrfCookie = request.cookies.get('csrftoken')?.value
  const csrfToken = request.headers.get('x-csrf-token') || csrfCookie
  const requestId = crypto.randomUUID()

  if (refresh) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    }
    if (access) {
      headers.Authorization = `Bearer ${access}`
    }
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }
    if (csrfCookie) {
      headers.Cookie = `csrftoken=${csrfCookie}`
    }

    await fetch(`${BACKEND_API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refresh }),
      cache: 'no-store',
    })
  }

  return buildProxyResponse({
    status: 204,
    payload: {},
    requestId,
    refreshedTokens: null,
    clearAuth: true,
  })
}
