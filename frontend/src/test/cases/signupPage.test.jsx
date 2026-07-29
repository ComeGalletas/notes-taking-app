import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SignUpPage from '../../components/SignUpPage'

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
  register: vi.fn(),
}))

import { register } from '../../../lib/api'

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    register.mockResolvedValue({})
    refreshSession.mockResolvedValue({ username: 'new-user' })
  })

  afterEach(() => {
    cleanup()
  })

  it('validates required email and password', async () => {
    render(<SignUpPage />)

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText('Email and password are required.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('registers and redirects to dashboard', async () => {
    render(<SignUpPage />)

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '1234' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('new@example.com', '1234')
      expect(refreshSession).toHaveBeenCalledTimes(1)
      expect(replace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows password validation error from backend payload', async () => {
    register.mockRejectedValue({
      response: {
        data: {
          error: {
            details: {
              password: ['Password too weak.'],
            },
          },
        },
      },
    })

    render(<SignUpPage />)

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '12' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText('Password too weak.')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
