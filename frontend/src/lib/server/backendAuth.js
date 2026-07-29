import {
  ACCESS_COOKIE_NAME,
  BACKEND_API_BASE_URL,
  REFRESH_COOKIE_NAME,
} from './authConfig'

function buildUrl(path, search = '') {
  return `${BACKEND_API_BASE_URL}${path}${search}`
}

async function parseBackendResponse(backendResponse) {
  const contentType = backendResponse.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await backendResponse.json()
    } catch {
      return {}
    }
  }

  const text = await backendResponse.text()
  return text ? { detail: text } : {}
}

async function callBackend({
  path,
  method = 'GET',
  accessToken,
  search = '',
  body,
  requestId,
  csrfToken,
  csrfCookie,
}) {
  const headers = {}
  const normalizedMethod = method.toUpperCase()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (requestId) {
    headers['X-Request-ID'] = requestId
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)) {
    headers['X-CSRFToken'] = csrfToken
  }

  if (csrfCookie && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)) {
    headers.Cookie = `csrftoken=${csrfCookie}`
  }

  return fetch(buildUrl(path, search), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
}

async function refreshAccessToken(refreshToken, requestId) {
  if (!refreshToken) {
    return null
  }

  const headers = {
    'Content-Type': 'application/json',
  }
  if (requestId) {
    headers['X-Request-ID'] = requestId
  }

  const response = await fetch(buildUrl('/auth/refresh/'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ refresh: refreshToken }),
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const payload = await parseBackendResponse(response)
  return {
    access: payload.access,
    refresh: payload.refresh,
  }
}

export async function callBackendWithAutoRefresh({
  request,
  path,
  method = 'GET',
  body,
  search = '',
  requestId = crypto.randomUUID(),
}) {
  const access = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  const refresh = request.cookies.get(REFRESH_COOKIE_NAME)?.value
  const csrfCookie = request.cookies.get('csrftoken')?.value
  const csrfToken = request.headers.get('x-csrf-token') || csrfCookie

  let backendResponse = await callBackend({
    path,
    method,
    accessToken: access,
    body,
    search,
    requestId,
    csrfToken,
    csrfCookie,
  })

  if (backendResponse.status !== 401) {
    return {
      backendResponse,
      payload: await parseBackendResponse(backendResponse),
      refreshedTokens: null,
      clearAuth: false,
      requestId,
    }
  }

  const refreshedTokens = await refreshAccessToken(refresh, requestId)
  if (!refreshedTokens?.access) {
    return {
      backendResponse,
      payload: await parseBackendResponse(backendResponse),
      refreshedTokens: null,
      clearAuth: true,
      requestId,
    }
  }

  backendResponse = await callBackend({
    path,
    method,
    accessToken: refreshedTokens.access,
    body,
    search,
    requestId,
    csrfToken,
    csrfCookie,
  })

  return {
    backendResponse,
    payload: await parseBackendResponse(backendResponse),
    refreshedTokens,
    clearAuth: false,
    requestId,
  }
}

export async function callBackendPublic({
  path,
  method = 'GET',
  body,
  requestId = crypto.randomUUID(),
}) {
  const headers = {}
  if (requestId) {
    headers['X-Request-ID'] = requestId
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  return {
    backendResponse: response,
    payload: await parseBackendResponse(response),
    requestId,
  }
}
