import React from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, useAuth } from './AuthProvider'

vi.mock('../../lib/api', () => ({
  getSession: vi.fn(),
}))

import { getSession } from '../../lib/api'

function AuthProbe() {
  const { status, user } = useAuth()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user?.username || 'none'}</span>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('bootstraps authenticated session user', async () => {
    getSession.mockResolvedValue({ user: { username: 'alice' } })

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('alice')
    })
  })

  it('falls back to unauthenticated when session fails', async () => {
    getSession.mockRejectedValue(new Error('unauthorized'))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('none')
    })
  })
})
