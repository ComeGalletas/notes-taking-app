import { beforeEach, describe, expect, it, vi } from 'vitest'

let requestInterceptor = null

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn((callback) => {
        requestInterceptor = callback
      }),
    },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApi),
  },
}))

describe('lib/api client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requestInterceptor = null
    document.cookie = ''
    mockApi.get.mockResolvedValue({ data: {} })
    mockApi.post.mockResolvedValue({ data: {} })
    mockApi.put.mockResolvedValue({ data: {} })
    mockApi.delete.mockResolvedValue({ data: {} })
  })

  it('adds csrf header for unsafe methods when cookie exists', async () => {
    document.cookie = 'csrftoken=test-token'
    await import('../../../lib/api')

    const config = { method: 'POST', headers: {} }
    const nextConfig = requestInterceptor(config)

    expect(nextConfig.headers['x-csrf-token']).toBe('test-token')
  })

  it('fetchNotes forwards category as query params', async () => {
    const { fetchNotes } = await import('../../../lib/api')
    mockApi.get.mockResolvedValue({ data: [{ id: 1 }] })

    const result = await fetchNotes('2')

    expect(mockApi.get).toHaveBeenCalledWith('/notes/', {
      params: { category: '2' },
    })
    expect(result).toEqual([{ id: 1 }])
  })

  it('createNote ensures csrf before posting', async () => {
    const { createNote } = await import('../../../lib/api')
    const payload = { title: 'Hello' }

    await createNote(payload)

    expect(mockApi.get).toHaveBeenCalledWith('/auth/csrf/')
    expect(mockApi.post).toHaveBeenCalledWith('/notes/', payload)
  })

  it('updateNote uses PUT with note id', async () => {
    const { updateNote } = await import('../../../lib/api')
    const payload = { title: 'Updated' }

    await updateNote(42, payload)

    expect(mockApi.get).toHaveBeenCalledWith('/auth/csrf/')
    expect(mockApi.put).toHaveBeenCalledWith('/notes/42/', payload)
  })
})
