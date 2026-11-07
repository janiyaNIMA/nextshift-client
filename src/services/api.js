/**
 * API Client for NextShift Backend
 * Aligned with ref/FRONTEND_API_HANDOFF.md
 */

const STORAGE_TOKEN_KEY = 'nextshift_access_token'
const STORAGE_BASE_URL_KEY = 'nextshift_api_base_url'

export const getApiBaseUrl = () => {
  return localStorage.getItem(STORAGE_BASE_URL_KEY) || 'http://172.237.81.7:8080/api/v1'
}

export const setApiBaseUrl = (url) => {
  localStorage.setItem(STORAGE_BASE_URL_KEY, url)
}

export const getToken = () => {
  return localStorage.getItem(STORAGE_TOKEN_KEY)
}

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(STORAGE_TOKEN_KEY)
  }
}

export const removeToken = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
}

/**
 * Parse human readable error message from API response
 */
export const formatErrorMessage = (errorData, status) => {
  if (!errorData) {
    return `Server error (${status || 'Unknown'})`
  }

  // Handle FastAPI validation error list
  if (Array.isArray(errorData.detail)) {
    return errorData.detail
      .map((item) => {
        const field = item.loc ? item.loc[item.loc.length - 1] : 'Field'
        return `${field}: ${item.msg}`
      })
      .join(' | ')
  }

  if (typeof errorData.detail === 'string') {
    return errorData.detail
  }

  if (errorData.message) {
    return errorData.message
  }

  return `Request failed with status ${status}`
}

/**
 * Generic request helper
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
  // Support endpoints starting with / or full URLs
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (err) {
    throw new Error(`Network error: Could not connect to API server (${url}). ${err.message}`)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  let responseData = null

  if (contentType.includes('application/json')) {
    responseData = await response.json()
  } else {
    const text = await response.text()
    try {
      responseData = JSON.parse(text)
    } catch {
      responseData = text ? { detail: text } : null
    }
  }

  if (!response.ok) {
    const errorMsg = formatErrorMessage(responseData, response.status)
    const error = new Error(errorMsg)
    error.status = response.status
    error.data = responseData
    throw error
  }

  return responseData
}

// ==========================================
// API Endpoints
// ==========================================

export const api = {
  /**
   * Health Check: GET http://localhost:8080/health (outside /api/v1)
   */
  async checkHealth() {
    const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
    // Infer root from baseUrl (strip /api/v1)
    const rootUrl = baseUrl.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8080'
    const res = await fetch(`${rootUrl}/health`)
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`)
    }
    return await res.json()
  },

  /**
   * Auth: Login
   */
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
  },

  /**
   * Auth: Register (role is student or employer)
   */
  async register({ name, email, password, role }) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
      skipAuth: true,
    })
  },

  /**
   * Auth: Get Current Profile
   */
  async getMe() {
    return request('/auth/me', {
      method: 'GET',
    })
  },

  /**
   * Jobs: Public list of published jobs
   */
  async getJobs({ category, location, skip = 0, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (location) params.append('location', location)
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)

    const queryString = params.toString() ? `?${params.toString()}` : ''
    return request(`/jobs${queryString}`, {
      method: 'GET',
      // Public endpoint: avoid sending auth headers so stale/role-specific tokens never block the feed.
      skipAuth: true,
    })
  },

  /**
   * Jobs: Get single published job details
   */
  async getJob(jobId) {
    return request(`/jobs/${jobId}`, {
      method: 'GET',
      // Public endpoint: fetch details without auth dependency.
      skipAuth: true,
    })
  },

  /**
   * Student: Book a vacancy
   */
  async bookJob(jobId) {
    return request(`/jobs/${jobId}/bookings`, {
      method: 'POST',
    })
  },

  /**
   * Student: Get my bookings
   */
  async getMyBookings({ skip = 0, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)
    const qs = params.toString() ? `?${params.toString()}` : ''

    return request(`/bookings/me${qs}`, {
      method: 'GET',
    })
  },

  /**
   * Employer: Create a job vacancy
   */
  async createJob(jobData) {
    return request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  },

  /**
   * Employer: Get jobs created by current employer
   */
  async getEmployerJobs({ skip = 0, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)
    const qs = params.toString() ? `?${params.toString()}` : ''

    return request(`/employer/jobs${qs}`, {
      method: 'GET',
    })
  },

  /**
   * Employer: View bookings / applicants for own job
   */
  async getJobBookings(jobId, { skip = 0, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)
    const qs = params.toString() ? `?${params.toString()}` : ''

    return request(`/employer/jobs/${jobId}/bookings${qs}`, {
      method: 'GET',
    })
  },

  /**
   * Admin: Get pending employers
   */
  async getPendingEmployers({ skip = 0, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)
    const qs = params.toString() ? `?${params.toString()}` : ''

    return request(`/admin/employers/pending${qs}`, {
      method: 'GET',
    })
  },

  /**
   * Admin: Approve employer
   */
  async approveEmployer(userId) {
    return request(`/admin/employers/${userId}/approve`, {
      method: 'PATCH',
    })
  },

  /**
   * Admin: Get pending jobs
   */
  async getPendingJobs({ skip = 0, limit = 50 } = {}) {
    const params = new URLSearchParams()
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)
    const qs = params.toString() ? `?${params.toString()}` : ''

    return request(`/admin/jobs/pending${qs}`, {
      method: 'GET',
    })
  },

  /**
   * Admin: Approve job
   */
  async approveJob(jobId) {
    return request(`/admin/jobs/${jobId}/approve`, {
      method: 'PATCH',
    })
  },
}
