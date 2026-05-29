import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  me:     ()     => api.get('/auth/me'),
}

// ── Groups ────────────────────────────────────────────────────────────────────
export const groupsApi = {
  list:         ()           => api.get('/groups'),
  create:       (data)       => api.post('/groups', data),
  get:          (id)         => api.get(`/groups/${id}`),
  update:       (id, data)   => api.put(`/groups/${id}`, data),
  delete:       (id)         => api.delete(`/groups/${id}`),
  addMember:    (id, data)   => api.post(`/groups/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
}

// ── Expenses ──────────────────────────────────────────────────────────────────
export const expensesApi = {
  list:   (groupId)           => api.get(`/groups/${groupId}/expenses`),
  create: (groupId, data)     => api.post(`/groups/${groupId}/expenses`, data),
  get:    (groupId, id)       => api.get(`/groups/${groupId}/expenses/${id}`),
  update: (groupId, id, data) => api.put(`/groups/${groupId}/expenses/${id}`, data),
  delete: (groupId, id)       => api.delete(`/groups/${groupId}/expenses/${id}`),
}

// ── Balances ──────────────────────────────────────────────────────────────────
export const balancesApi = {
  get: (groupId) => api.get(`/groups/${groupId}/balances`),
}

// ── Settlements ───────────────────────────────────────────────────────────────
export const settlementsApi = {
  list:   (groupId)       => api.get(`/groups/${groupId}/settlements`),
  create: (groupId, data) => api.post(`/groups/${groupId}/settlements`, data),
}

// ── Activity ──────────────────────────────────────────────────────────────────
export const activityApi = {
  group:     (groupId) => api.get(`/groups/${groupId}/activity`),
  dashboard: ()        => api.get('/dashboard/activity'),
}

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  groupChat:  (groupId, data) => api.post(`/groups/${groupId}/ai/chat`, data),
  globalChat: (data)          => api.post('/ai/chat', data),
}
