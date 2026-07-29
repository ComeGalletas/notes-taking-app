import { describe, expect, it } from 'vitest'

import { buildProxyResponse } from './proxyResponse'

describe('buildProxyResponse', () => {
  it('returns normalized error payload and request id header', async () => {
    const response = buildProxyResponse({
      status: 401,
      payload: { detail: 'Invalid token' },
      requestId: 'req-123',
      refreshedTokens: null,
      clearAuth: false,
    })

    expect(response.status).toBe(401)
    expect(response.headers.get('x-request-id')).toBe('req-123')

    const body = await response.json()
    expect(body.error.code).toBe('unauthorized')
    expect(body.error.message).toBe('Invalid token')
    expect(body.error.requestId).toBe('req-123')
  })

  it('clears auth cookies when requested', () => {
    const response = buildProxyResponse({
      status: 401,
      payload: { detail: 'Expired session' },
      requestId: 'req-logout',
      refreshedTokens: null,
      clearAuth: true,
    })

    const setCookieHeader = response.headers.get('set-cookie') || ''
    expect(setCookieHeader).toContain('notes_access_token=')
    expect(setCookieHeader).toContain('notes_refresh_token=')
  })
})
