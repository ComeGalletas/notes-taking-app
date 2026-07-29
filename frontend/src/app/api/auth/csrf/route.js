import { NextResponse } from 'next/server'

import { callBackendPublic } from '../../../../lib/server/backendAuth'
import { buildProxyResponse } from '../../../../lib/server/proxyResponse'

export async function GET() {
  const { backendResponse, payload, requestId } = await callBackendPublic({
    path: '/auth/csrf/',
    method: 'GET',
  })

  const response = buildProxyResponse({
    status: backendResponse.status,
    payload,
    requestId,
    refreshedTokens: null,
    clearAuth: false,
  })

  if (backendResponse.ok && payload?.csrfToken) {
    response.cookies.set('csrftoken', payload.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  }

  return response
}
