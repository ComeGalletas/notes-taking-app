/*
  Auth smoke test against the Next.js internal API.
  Requires running services:
  - Next.js frontend (default: http://localhost:3000)
  - Django backend behind Next proxy routes
*/

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 10000)

function randomUser() {
  const suffix = Math.random().toString(36).slice(2, 10)
  return `smoke_${suffix}`
}

function parseSetCookie(setCookieValue) {
  if (!setCookieValue) {
    return []
  }

  const values = Array.isArray(setCookieValue)
    ? setCookieValue
    : setCookieValue.split(/,(?=[^;]+?=)/g)

  return values.map((entry) => entry.split(';')[0]).filter(Boolean)
}

function getSetCookieHeaders(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie()
  }

  const single = response.headers.get('set-cookie')
  return single ? [single] : []
}

class CookieJar {
  constructor() {
    this.cookies = new Map()
  }

  absorb(response) {
    const setCookies = getSetCookieHeaders(response)
    for (const raw of setCookies) {
      for (const cookie of parseSetCookie(raw)) {
        const separator = cookie.indexOf('=')
        if (separator === -1) {
          continue
        }

        const name = cookie.slice(0, separator).trim()
        const value = cookie.slice(separator + 1).trim()

        if (!name) {
          continue
        }

        if (value === '') {
          this.cookies.delete(name)
        } else {
          this.cookies.set(name, value)
        }
      }
    }
  }

  headerValue() {
    if (this.cookies.size === 0) {
      return ''
    }

    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }

  get(name) {
    return this.cookies.get(name)
  }
}

function isDefaultBaseUrl() {
  return !process.env.SMOKE_BASE_URL
}

function normalizeError(error) {
  if (!error) {
    return 'unknown error'
  }

  if (error.name === 'AbortError') {
    return `request timed out after ${REQUEST_TIMEOUT_MS}ms`
  }

  if (error.cause && typeof error.cause === 'object') {
    const code = error.cause.code ? ` (${error.cause.code})` : ''
    return `${error.message}${code}`
  }

  return error.message || String(error)
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function preflightConnectivity(baseUrl) {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/auth/csrf/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    return response.ok
  } catch {
    return false
  }
}

async function resolveBaseUrl() {
  if (await preflightConnectivity(BASE_URL)) {
    return BASE_URL
  }

  if (isDefaultBaseUrl()) {
    const fallback = 'http://127.0.0.1:3000'
    if (fallback !== BASE_URL && (await preflightConnectivity(fallback))) {
      console.log(`[smoke] Base URL fallback selected: ${fallback}`)
      return fallback
    }
  }

  throw new Error(
    `Could not connect to ${BASE_URL}. Ensure Next.js is running (npm run dev) and backend is reachable behind /api proxy.`,
  )
}

async function request(baseUrl, jar, path, { method = 'GET', body, csrf = false, stepLabel = path } = {}) {
  const headers = {
    Accept: 'application/json',
  }

  const cookieHeader = jar.headerValue()
  if (cookieHeader) {
    headers.Cookie = cookieHeader
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (csrf) {
    const csrfToken = jar.get('csrftoken')
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken
    }
  }

  let response
  try {
    response = await fetchWithTimeout(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    throw new Error(`${stepLabel} network error: ${normalizeError(error)}`)
  }

  jar.absorb(response)

  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    payload = await response.json()
  }

  return { response, payload }
}

function assertStatus(actual, expected, label, payload) {
  if (actual !== expected) {
    const details = payload ? ` | payload=${JSON.stringify(payload)}` : ''
    throw new Error(`${label} failed: expected ${expected}, got ${actual}${details}`)
  }
}

async function run() {
  const jar = new CookieJar()
  const username = randomUser()
  const password = 'secure1234'
  const resolvedBaseUrl = await resolveBaseUrl()

  console.log(`[smoke] Base URL: ${resolvedBaseUrl}`)

  const csrfResult = await request(resolvedBaseUrl, jar, '/api/auth/csrf/', {
    stepLabel: 'csrf bootstrap',
  })
  assertStatus(csrfResult.response.status, 200, 'csrf bootstrap', csrfResult.payload)

  const registerResult = await request(resolvedBaseUrl, jar, '/api/auth/register/', {
    method: 'POST',
    body: { username, password },
    csrf: true,
    stepLabel: 'register',
  })
  assertStatus(registerResult.response.status, 201, 'register', registerResult.payload)

  const sessionResult = await request(resolvedBaseUrl, jar, '/api/auth/session/', {
    stepLabel: 'session after register',
  })
  assertStatus(sessionResult.response.status, 200, 'session after register', sessionResult.payload)

  const categoriesResult = await request(resolvedBaseUrl, jar, '/api/categories/', {
    stepLabel: 'categories fetch',
  })
  assertStatus(categoriesResult.response.status, 200, 'categories fetch', categoriesResult.payload)

  const createNoteResult = await request(resolvedBaseUrl, jar, '/api/notes/', {
    method: 'POST',
    body: {
      title: 'Smoke Test Note',
      content: 'Generated by smoke test',
      color: '#FFE082',
      category: null,
    },
    csrf: true,
    stepLabel: 'note create',
  })
  assertStatus(createNoteResult.response.status, 201, 'note create', createNoteResult.payload)

  const notesResult = await request(resolvedBaseUrl, jar, '/api/notes/', {
    stepLabel: 'notes list',
  })
  assertStatus(notesResult.response.status, 200, 'notes list', notesResult.payload)

  const logoutResult = await request(resolvedBaseUrl, jar, '/api/auth/logout/', {
    method: 'POST',
    csrf: true,
    stepLabel: 'logout',
  })
  assertStatus(logoutResult.response.status, 204, 'logout')

  const sessionAfterLogout = await request(resolvedBaseUrl, jar, '/api/auth/session/', {
    stepLabel: 'session after logout',
  })
  assertStatus(
    sessionAfterLogout.response.status,
    401,
    'session after logout should be unauthorized',
    sessionAfterLogout.payload,
  )

  console.log('[smoke] Auth pipeline smoke test passed.')
}

run().catch((error) => {
  console.error('[smoke] FAILED:', error.message)
  console.error('  1) backend: ../.venv/Scripts/python.exe manage.py runserver')
  console.error('  2) frontend: npm run dev')
  process.exit(1)
})
