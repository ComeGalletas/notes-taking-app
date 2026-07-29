'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import dashboardTeaImage from '../assets/dashboard_tea.png'
import { fetchCategories, fetchNotes, logout } from '../../lib/api'
import { useAuth } from './AuthProvider'

function formatUpdatedLabel(value) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(todayStart.getDate() - 1)
  const noteDayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (noteDayStart.getTime() === todayStart.getTime()) {
    return 'today'
  }

  if (noteDayStart.getTime() === yesterdayStart.getTime()) {
    return 'yesterday'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function colorToRgba(color, alpha) {
  if (!color) {
    return `rgba(255, 224, 130, ${alpha})`
  }

  const hexColor = color.trim().replace('#', '')

  if (hexColor.length === 3) {
    const red = Number.parseInt(hexColor[0] + hexColor[0], 16)
    const green = Number.parseInt(hexColor[1] + hexColor[1], 16)
    const blue = Number.parseInt(hexColor[2] + hexColor[2], 16)
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  if (hexColor.length === 6) {
    const red = Number.parseInt(hexColor.slice(0, 2), 16)
    const green = Number.parseInt(hexColor.slice(2, 4), 16)
    const blue = Number.parseInt(hexColor.slice(4, 6), 16)
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  return color
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, markLoggedOut } = useAuth()
  const titleRefs = useRef({})
  const [categories, setCategories] = useState([])
  const [notes, setNotes] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [truncatedTitles, setTruncatedTitles] = useState({})

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const loadedCategories = await fetchCategories()
        setCategories(loadedCategories)

        const selected = activeCategory === 'all' ? null : activeCategory
        const loadedNotes = await fetchNotes(selected)
        setNotes(loadedNotes)
      } catch (error) {
        if (error.response?.status === 401) {
          router.replace('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeCategory, router])

  useEffect(() => {
    function updateTruncationState() {
      const nextState = {}

      for (const note of notes) {
        const element = titleRefs.current[note.id]
        if (!element) {
          continue
        }

        nextState[note.id] = element.scrollHeight > element.clientHeight + 1
      }

      setTruncatedTitles(nextState)
    }

    updateTruncationState()

    window.addEventListener('resize', updateTruncationState)
    return () => window.removeEventListener('resize', updateTruncationState)
  }, [notes])

  const boardTitle = useMemo(() => {
    if (activeCategory === 'all') {
      return 'All Notes'
    }

    const found = categories.find((category) => category.id === activeCategory)
    return found ? found.name : 'Notes'
  }, [activeCategory, categories])

  function handleCreateNote() {
    const categoryQuery = activeCategory === 'all' ? '' : `?category=${activeCategory}`
    router.push(`/notes/new${categoryQuery}`)
  }

  function handleOpenNote(noteId) {
    router.push(`/notes/${noteId}`)
  }

  async function handleLogout() {
    await logout()
    markLoggedOut()
    router.replace('/login')
  }

  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-top">
          <p className="muted">{user?.username?.split('@')[0] || 'Guest'}</p>
        </div>

        <div className="category-list">
          <button
            type="button"
            className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <div className="category-label-wrap">
              <span className="category-label all-notes-label">All Categories</span>
            </div>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span
                className="category-dot"
                style={{ backgroundColor: category.color || '#FCDC94' }}
                aria-hidden="true"
              />
              <div className="category-label-wrap">
                <span className="category-label">{category.name}</span>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <section className="board-panel">
        <header className="board-header">
          {/* For using the category name as a header if needed */}
          <button type="button" className="new-note-button" onClick={handleCreateNote}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M8 3.33334V12.6667M3.33334 8H12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="new-note-text">New Note</span>
          </button>
        </header>

        <div className="notes-board">
          {loading && <p className="muted">Loading your notes...</p>}
          {!loading && notes.length === 0 && (
            <div className="empty-board">
              <div className="empty-board-content">
                <Image
                  src={dashboardTeaImage}
                  alt="Tea cup illustration"
                  className="empty-board-image"
                  width={297}
                  height={296}
                  priority
                />
                <p className="empty-board-caption">I’m just here waiting for your charming notes...</p>
              </div>
            </div>
          )}
          {!loading &&
            notes.map((note) => (
              <article
                key={note.id}
                className="note-card"
                style={{
                  backgroundColor: colorToRgba(note.color || '#FFE082', 0.5),
                  border: `3px solid ${note.color || '#FFE082'}`,
                }}
                onClick={() => handleOpenNote(note.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleOpenNote(note.id)
                  }
                }}
              >
                <div className="note-meta">
                  <p><b>{formatUpdatedLabel(note.updated_at)}</b></p>
                  <p>{note.category_name || 'No category'}</p>
                </div>
                <h3
                  ref={(element) => {
                    if (element) {
                      titleRefs.current[note.id] = element
                    } else {
                      delete titleRefs.current[note.id]
                    }
                  }}
                  className={truncatedTitles[note.id] ? 'is-truncated' : ''}
                >
                  {note.title}
                </h3>
                <p>{note.content || 'No content yet.'}</p>
              </article>
            ))}
        </div>
      </section>
    </main>
  )
}
