import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import DashboardPage from '../../components/DashboardPage'

const push = vi.fn()
const replace = vi.fn()
const markLoggedOut = vi.fn()

vi.mock('next/image', () => ({
  default: (props) => <img alt={props.alt} />,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace,
  }),
}))

vi.mock('../../components/AuthProvider', () => ({
  useAuth: () => ({
    user: { username: 'alice@example.com' },
    markLoggedOut,
  }),
}))

vi.mock('../../../lib/api', () => ({
  fetchCategories: vi.fn(),
  fetchNotes: vi.fn(),
  logout: vi.fn(),
}))

import { fetchCategories, fetchNotes, logout } from '../../../lib/api'

describe('DashboardPage flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchCategories.mockResolvedValue([
      { id: 1, name: 'Random Thoughts', color: '#EF9C66' },
      { id: 2, name: 'School', color: '#FCDC94' },
    ])
    fetchNotes.mockResolvedValue([
      {
        id: 10,
        title: 'Note A',
        content: 'Content A',
        color: '#FFE082',
        category_name: 'Random Thoughts',
        updated_at: new Date().toISOString(),
      },
    ])
    logout.mockResolvedValue({})
  })

  afterEach(() => {
    cleanup()
  })

  it('loads categories and notes on mount', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(fetchCategories).toHaveBeenCalled()
      expect(fetchNotes).toHaveBeenCalledWith(null)
      expect(screen.getByText('Note A')).toBeInTheDocument()
    })
  })

  it('navigates to new note with selected category', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('School')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('School'))
    fireEvent.click(screen.getByRole('button', { name: /new note/i }))

    expect(push).toHaveBeenCalledWith('/notes/new?category=2')
  })

  it('redirects to login on unauthorized data load', async () => {
    fetchCategories.mockRejectedValueOnce({ response: { status: 401 } })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/login')
    })
  })

  it('logs out and redirects', async () => {
    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(fetchCategories).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1)
      expect(markLoggedOut).toHaveBeenCalledTimes(1)
      expect(replace).toHaveBeenCalledWith('/login')
    })
  })
})
