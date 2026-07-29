import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
  getCookieBaseOptions,
} from './authConfig'

export function setAuthCookies(response, { access, refresh }) {
  const base = getCookieBaseOptions()

  if (access) {
    response.cookies.set(ACCESS_COOKIE_NAME, access, {
      ...base,
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    })
  }

  if (refresh) {
    response.cookies.set(REFRESH_COOKIE_NAME, refresh, {
      ...base,
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    })
  }
}

export function clearAuthCookies(response) {
  const base = getCookieBaseOptions()

  response.cookies.set(ACCESS_COOKIE_NAME, '', {
    ...base,
    maxAge: 0,
  })

  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    ...base,
    maxAge: 0,
  })
}
