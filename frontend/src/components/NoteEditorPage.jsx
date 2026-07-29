'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  createNote,
  deleteNote,
  fetchCategories,
  fetchNote,
  updateNote,
} from '../../lib/api'

import * as Select from '@radix-ui/react-select'

const DEFAULT_COLOR = '#FFE082'

function formatFullUpdatedDate(value) {
  if (!value) {
    return 'Last updated after save'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Last updated after save'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date)
}

export default function NoteEditorPage({ noteId = null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = !noteId

  const [categories, setCategories] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = categories.find((item) => String(item.id) === String(categoryId))
  const noteColor = selectedCategory?.color || DEFAULT_COLOR

  useEffect(() => {
    async function loadData() {
      try {
        const loadedCategories = await fetchCategories()
        setCategories(loadedCategories)
        const firstCategoryId = loadedCategories[0] ? String(loadedCategories[0].id) : ''

        const selectedCategoryIdFromQuery = searchParams.get('category')
        const initialCategoryId = selectedCategoryIdFromQuery || firstCategoryId
        setCategoryId(initialCategoryId)

        if (!isNew) {
          const loadedNote = await fetchNote(noteId)
          setTitle(loadedNote.title)
          setContent(loadedNote.content)
          setLastUpdatedAt(loadedNote.updated_at)
          setCategoryId(loadedNote.category ? String(loadedNote.category) : initialCategoryId)
        }
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          router.replace('/login')
          return
        }
        setError('Could not load note data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isNew, noteId, searchParams])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      title,
      content,
      color: noteColor,
      category: categoryId || null,
    }

    try {
      if (isNew) {
        await createNote(payload)
      } else {
        await updateNote(noteId, payload)
      }
      router.push('/dashboard')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        router.replace('/login')
        return
      }
      setError('Could not save note.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (isNew) {
      return
    }

    try {
      await deleteNote(noteId)
      router.push('/dashboard')
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        router.replace('/login')
        return
      }
      setError('Could not delete note.')
    }
  }

  if (loading) {
    return (
      <main className="editor-page">
        <p className="muted">Loading note...</p>
      </main>
    )
  }

  return (
    <main className="editor-page">
      <div className="note-editor-shell">
        <div className="note-editor-toolbar">
          <label className="sr-only" htmlFor="category">
            Category
          </label>
            <div className="note-editor-category-control">
              <Select.Root
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <Select.Trigger className="category-trigger">
                  <span
                    className="category-dot"
                    style={{ backgroundColor: selectedCategory?.color || '#5f4b2b' }}
                    aria-hidden="true"
                  />
                  <Select.Value placeholder="No categories" />
                  <Select.Icon className="category-caret" aria-hidden="true">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      focusable="false"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content
                    className="category-content"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                  >
                    <Select.Viewport>
                      {categories.map((item) => (
                        <Select.Item
                          key={item.id}
                          value={item.id.toString()}
                          className="category-item"
                        >
                          <span
                            className="category-dot"
                            style={{ backgroundColor: item.color }}
                          />
                          <Select.ItemText>{item.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
        </div>

        <section className="note-editor-card" style={{ backgroundColor: noteColor }}>
          <p className="note-editor-updated">Last updated {formatFullUpdatedDate(lastUpdatedAt)}</p>

          <form className="note-editor-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="title">
              Title
            </label>
            <input
              className="note-editor-title"
              id="title"
              placeholder="Note Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
            />

            <label className="sr-only" htmlFor="content">
              Content
            </label>
            <textarea
              className="note-editor-content"
              id="content"
              placeholder="Pour your heart out..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={12}
            />

            {error && <p className="form-error">{error}</p>}

            <div className="editor-actions">
              {!isNew && (
                <button type="button" className="delete-button" onClick={handleDelete}>
                  Delete note
                </button>
              )}
              <button type="submit" className="new-note-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save note'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
