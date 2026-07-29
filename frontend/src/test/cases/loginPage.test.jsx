import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import LoginPage from '../../components/LoginPage'

const replace = vi.fn()
const refreshSession = vi.fn()

vi.mock('next/image', () => ({
  default: (props) => <img alt={props.alt} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace,
  }),
}))

vi.mock('../../components/AuthProvider', () => ({
  useAuth: () => ({
    refreshSession,
  }),
}))

vi.mock('../../../lib/api', () => ({
  login: vi.fn(),
}))

import { login } from '../../../lib/api'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    login.mockResolvedValue({})
    refreshSession.mockResolvedValue({ username: 'alice' })
  })

  afterEach(() => {
    cleanup()
  })

  it('validates required email and password', async () => {
    render(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }))

    expect(await screen.findByText('Email and password are required.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('logs in and redirects to dashboard', async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'alice@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '1234' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('alice@example.com', '1234')
      expect(refreshSession).toHaveBeenCalledTimes(1)
      expect(replace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows backend error message when login fails', async () => {
    login.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Invalid credentials.',
          },
        },
      },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'alice@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'bad-password' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }))

    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
