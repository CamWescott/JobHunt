import { auth } from './firebase'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const headers = { ...options.headers }

  // Get fresh Firebase ID token
  const currentUser = auth.currentUser
  if (currentUser) {
    const token = await currentUser.getIdToken()
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }


  return res.json()
}

export const api = {
  // Auth (verify token with backend)
  getMe: () => request('/auth/me'),
  deleteAccount: () => request('/auth/delete-account', { method: 'DELETE' }),

  // Resume
  uploadResume: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request('/resume/upload', { method: 'POST', body: formData })
  },
  listResumes: () => request('/resume/list'),
  deleteResume: (id) => request(`/resume/${id}`, { method: 'DELETE' }),

  // Tailor
  tailorResume: (data) => request('/tailor/analyze', { method: 'POST', body: data }),
  getTailorHistory: () => request('/tailor/history'),
  exportResumePdf: (data) => request('/tailor/export/resume-pdf', { method: 'POST', body: data }),
  exportCoverLetterPdf: (data) => request('/tailor/export/cover-letter-pdf', { method: 'POST', body: data }),

  // Interview Prep
  interviewPrep: (data) => request('/tailor/interview-prep', { method: 'POST', body: data }),

  // LinkedIn
  linkedinOptimize: (data) => request('/tailor/linkedin-optimize', { method: 'POST', body: data }),

  // Applications
  createApplication: (data) => request('/applications/', { method: 'POST', body: data }),
  listApplications: () => request('/applications/'),
  getApplicationStats: () => request('/applications/stats'),
  updateApplication: (id, data) => request(`/applications/${id}`, { method: 'PUT', body: data }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),

  // Payments
  createCheckout: (data) => request('/payments/create-checkout', { method: 'POST', body: data }),
  getSubscriptionStatus: () => request('/payments/status'),
  setPlan: (plan) => request('/payments/set-plan', { method: 'POST', body: { plan } }),
}
