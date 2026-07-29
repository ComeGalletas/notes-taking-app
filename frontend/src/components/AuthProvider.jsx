'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '../../lib/api'

const AuthContext = createContext({
  status: 'loading',
  user: null,
  refreshSession: async () => {},
  markLoggedOut: () => {},
})

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)

  const refreshSession = useCallback(async () => {
    setStatus('loading')
    try {
      const session = await getSession()
      setUser(session.user || null)
      setStatus(session.user ? 'authenticated' : 'unauthenticated')
      return session.user || null
    } catch {
      setUser(null)
      setStatus('unauthenticated')
      return null
    }
  }, [])

  const markLoggedOut = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const value = useMemo(
    () => ({
      status,
      user,
      refreshSession,
      markLoggedOut,
    }),
    [status, user, refreshSession, markLoggedOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
