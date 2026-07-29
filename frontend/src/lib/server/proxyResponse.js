import { NextResponse } from 'next/server'

import { clearAuthCookies, setAuthCookies } from './authCookies'

function mapErrorCode(status) {
  if (status === 400) return 'bad_request'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 429) return 'rate_limited'
  if (status >= 500) return 'upstream_server_error'
  return 'upstream_error'
}

function buildErrorBody(payload, status, requestId) {
  const detail = payload?.detail
  const message =
    typeof detail === 'string'
      ? detail
      : 'Request failed while communicating with the upstream API.'

  return {
    error: {
      code: mapErrorCode(status),
      message,
      status,
      requestId,
      details: payload,
    },
  }
}

export function buildProxyResponse({
  status,
  payload,
  requestId,
  refreshedTokens,
  clearAuth,
}) {
  let response

  if (status === 204) {
    response = new NextResponse(null, { status: 204 })
  } else if (status >= 400) {
    response = NextResponse.json(buildErrorBody(payload, status, requestId), { status })
  } else {
    response = NextResponse.json(payload, { status })
  }

  response.headers.set('x-request-id', requestId)

  if (refreshedTokens) {
    setAuthCookies(response, refreshedTokens)
  }

  if (clearAuth) {
    clearAuthCookies(response)
  }

  return response
}
