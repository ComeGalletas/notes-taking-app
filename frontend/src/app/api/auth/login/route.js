import { callBackendPublic } from '../../../../lib/server/backendAuth'
import { buildProxyResponse } from '../../../../lib/server/proxyResponse'

export async function POST(request) {
  const credentials = await request.json()

  const { backendResponse, payload, requestId } = await callBackendPublic({
    path: '/auth/login/',
    method: 'POST',
    body: credentials,
  })

  return buildProxyResponse({
    status: backendResponse.status,
    payload: backendResponse.ok
      ? {
          user: payload.user,
          detail: 'Login successful.',
        }
      : payload,
    requestId,
    refreshedTokens: backendResponse.ok
      ? {
          access: payload.access,
          refresh: payload.refresh,
        }
      : null,
    clearAuth: false,
  })
}
