import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import NoteEditorPage from '../../components/NoteEditorPage'

const push = vi.fn()
const replace = vi.fn()
const searchGet = vi.fn(() => null)

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace,
  }),
  useSearchParams: () => ({
    get: searchGet,
  }),
}))

vi.mock('@radix-ui/react-select', () => {
  const Root = ({ children }) => <div>{children}</div>
  const Trigger = ({ children, className }) => (
    <button type="button" className={className}>
      {children}
    </button>
  )
  const Value = ({ placeholder }) => <span>{placeholder}</span>
  const Icon = ({ children, className }) => <span className={className}>{children}</span>
  const Portal = ({ children }) => <>{children}</>
  const Content = ({ children, className }) => <div className={className}>{children}</div>
  const Viewport = ({ children }) => <div>{children}</div>
  const Item = ({ children, className }) => <div className={className}>{children}</div>
  const ItemText = ({ children }) => <span>{children}</span>

  return { Root, Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText }
})

vi.mock('../../../lib/api', () => ({
  createNote: vi.fn(),
  fetchCategories: vi.fn(),
  fetchNote: vi.fn(),
  updateNote: vi.fn(),
}))

import {
  createNote,
  fetchCategories,
  fetchNote,
  updateNote,
} from '../../../lib/api'

describe('NoteEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    fetchCategories.mockResolvedValue([
      { id: 1, name: 'Random Thoughts', color: '#EF9C66' },
      { id: 2, name: 'School', color: '#FCDC94' },
    ])

    createNote.mockResolvedValue({ id: 99, updated_at: new Date().toISOString() })
    updateNote.mockResolvedValue({ id: 99, updated_at: new Date().toISOString() })
    fetchNote.mockResolvedValue({
      id: 5,
      title: 'Existing title',
      content: 'Existing content',
      updated_at: new Date().toISOString(),
      category: 1,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('autosaves a new note after user edits', async () => {
    render(<NoteEditorPage />)

    const titleInput = await screen.findByPlaceholderText('Note Title')

    vi.useFakeTimers()
    fireEvent.change(titleInput, { target: { value: 'My test note' } })

    await vi.advanceTimersByTimeAsync(2000)

    expect(createNote).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My test note',
        category: '1',
      }),
    )
  })

  it('saves existing note on close and redirects to dashboard', async () => {
    render(<NoteEditorPage noteId="5" />)

    await screen.findByDisplayValue('Existing title')

    fireEvent.click(screen.getByRole('button', { name: /save and close note/i }))

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith(
        5,
        expect.objectContaining({
          title: 'Existing title',
          content: 'Existing content',
        }),
      )
      expect(push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('redirects to login when loading fails with 401', async () => {
    fetchCategories.mockRejectedValueOnce({ response: { status: 401 } })

    render(<NoteEditorPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/login')
    })
  })
})
