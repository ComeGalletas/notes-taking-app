import { callBackendWithAutoRefresh } from '../../../../lib/server/backendAuth'
import { buildProxyResponse } from '../../../../lib/server/proxyResponse'

export async function GET(request) {
  const { backendResponse, payload, refreshedTokens, clearAuth, requestId } =
    await callBackendWithAutoRefresh({
      request,
      path: '/auth/me/',
      method: 'GET',
    })

  return buildProxyResponse({
    status: backendResponse.status,
    payload,
    requestId,
    refreshedTokens,
    clearAuth,
  })
}
