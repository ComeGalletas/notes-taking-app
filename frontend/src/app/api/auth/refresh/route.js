import { callBackendPublic } from '../../../../lib/server/backendAuth'
import { buildProxyResponse } from '../../../../lib/server/proxyResponse'
import { REFRESH_COOKIE_NAME } from '../../../../lib/server/authConfig'

export async function POST(request) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value

  if (!refreshToken) {
    return buildProxyResponse({
      status: 401,
      payload: { detail: 'Missing refresh token.' },
      requestId: crypto.randomUUID(),
      refreshedTokens: null,
      clearAuth: true,
    })
  }

  const { backendResponse, payload, requestId } = await callBackendPublic({
    path: '/auth/refresh/',
    method: 'POST',
    body: { refresh: refreshToken },
  })

  return buildProxyResponse({
    status: backendResponse.status,
    payload: backendResponse.ok ? { detail: 'Session refreshed.' } : payload,
    requestId,
    refreshedTokens: backendResponse.ok
      ? {
          access: payload.access,
          refresh: payload.refresh,
        }
      : null,
    clearAuth: !backendResponse.ok,
  })
}
