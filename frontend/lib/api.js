import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return null
  }

  const pairs = document.cookie ? document.cookie.split('; ') : []
  const found = pairs.find((pair) => pair.startsWith(`${name}=`))
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null
}

function isUnsafeMethod(method) {
  const normalized = (method || 'GET').toUpperCase()
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalized)
}

api.interceptors.request.use((config) => {
  if (isUnsafeMethod(config.method)) {
    const csrfToken = getCookieValue('csrftoken')
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken
    }
  }
  return config
})

export async function ensureCsrf() {
  await api.get('/auth/csrf/')
}

export async function login(username, password) {
  await ensureCsrf()
  const response = await api.post('/auth/login/', { username, password })
  return response.data
}

export async function register(username, password) {
  await ensureCsrf()
  const response = await api.post('/auth/register/', { username, password })
  return response.data
}

export async function getSession() {
  const response = await api.get('/auth/session/')
  return response.data
}

export async function fetchCategories() {
  const response = await api.get('/categories/')
  return response.data
}

export async function fetchNotes(categoryId) {
  const response = await api.get('/notes/', {
    params: categoryId ? { category: categoryId } : {},
  })
  return response.data
}

export async function fetchNote(noteId) {
  const response = await api.get(`/notes/${noteId}/`)
  return response.data
}

export async function createNote(payload) {
  await ensureCsrf()
  const response = await api.post('/notes/', payload)
  return response.data
}

export async function updateNote(noteId, payload) {
  await ensureCsrf()
  const response = await api.put(`/notes/${noteId}/`, payload)
  return response.data
}

export async function deleteNote(noteId) {
  await ensureCsrf()
  await api.delete(`/notes/${noteId}/`)
}

export async function logout() {
  await ensureCsrf()
  await api.post('/auth/logout/')
}

export default api
