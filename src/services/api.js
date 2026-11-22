/**
 * API Client for NextShift Backend (Spring Boot / Java 21)
 * Aligned with docs/API_ENDPOINTS.md
 */

const STORAGE_TOKEN_KEY = 'nextshift_access_token'
const STORAGE_BASE_URL_KEY = 'nextshift_api_base_url'

export const getApiBaseUrl = () => {
  const stored = localStorage.getItem(STORAGE_BASE_URL_KEY)
  if (stored && !stored.includes('172.237.81.7') && !stored.includes(':8000')) {
    return stored
  }
  return 'http://localhost:8080/api/v1'
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
 * Normalizers to guarantee seamless compatibility between
 * Java backend DTOs (camelCase / uppercase roles) and frontend components
 */
export const normalizeUser = (u) => {
  if (!u) return null
  const role = (u.role || '').toLowerCase()
  const isApproved = u.approved !== undefined ? Boolean(u.approved) : Boolean(u.is_approved)
  const isActive = u.active !== undefined ? Boolean(u.active) : Boolean(u.is_active)
  const createdAt = u.createdAt || u.created_at
  return {
    ...u,
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    rawRole: u.role,
    is_approved: isApproved,
    approved: isApproved,
    is_active: isActive,
    active: isActive,
    created_at: createdAt,
    createdAt,
  }
}

export const normalizeJob = (job) => {
  if (!job) return null
  const payAmount = job.payAmount !== undefined ? Number(job.payAmount) : Number(job.pay_amount || 0)
  const payUnit = job.payUnit || job.pay_unit || 'per_hour'
  const startsAt = job.startsAt || job.starts_at
  const endsAt = job.endsAt || job.ends_at
  const capacity = job.capacity || 0
  const remainingCapacity =
    job.remainingCapacity !== undefined
      ? job.remainingCapacity
      : job.remaining_capacity !== undefined
      ? job.remaining_capacity
      : capacity
  const employerId = job.employerId !== undefined ? job.employerId : job.employer_id
  const employerName = job.employerName || job.employer_name || ''
  const createdAt = job.createdAt || job.created_at
  const publishedAt = job.publishedAt || job.published_at
  const status = (job.status || 'PENDING').toLowerCase()

  return {
    ...job,
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    location: job.location,
    capacity,
    // CamelCase
    payAmount,
    payUnit,
    startsAt,
    endsAt,
    remainingCapacity,
    employerId,
    employerName,
    createdAt,
    publishedAt,
    // Snake_case
    pay_amount: payAmount,
    pay_unit: payUnit,
    starts_at: startsAt,
    ends_at: endsAt,
    remaining_capacity: remainingCapacity,
    employer_id: employerId,
    employer_name: employerName,
    created_at: createdAt,
    published_at: publishedAt,
    // Status
    status,
    rawStatus: job.status,
  }
}

export const normalizeBooking = (b) => {
  if (!b) return null
  const status = (b.status || 'CONFIRMED').toLowerCase()
  const createdAt = b.createdAt || b.created_at
  const jobId = b.jobId !== undefined ? b.jobId : b.job_id
  const studentId = b.studentId !== undefined ? b.studentId : b.student_id

  const student = b.student || {
    id: studentId,
    name: b.studentName || b.student_name || (studentId ? `Student #${studentId}` : 'Student'),
    email: b.studentEmail || b.student_email || '',
  }

  const job = b.job || {
    id: jobId,
    title: b.jobTitle || b.title,
    location: b.jobLocation || b.location,
    category: b.jobCategory || b.category,
    pay_amount: b.payAmount !== undefined ? Number(b.payAmount) : Number(b.pay_amount || 0),
    payAmount: b.payAmount !== undefined ? Number(b.payAmount) : Number(b.pay_amount || 0),
    pay_unit: b.payUnit || b.pay_unit || 'per_hour',
    payUnit: b.payUnit || b.pay_unit || 'per_hour',
    starts_at: b.startsAt || b.starts_at,
    startsAt: b.startsAt || b.starts_at,
    ends_at: b.endsAt || b.ends_at,
    endsAt: b.endsAt || b.ends_at,
    description: b.jobDescription || b.description,
  }

  return {
    ...b,
    id: b.id,
    jobId,
    job_id: jobId,
    studentId,
    student_id: studentId,
    studentName: b.studentName || student.name,
    studentEmail: b.studentEmail || student.email,
    jobTitle: b.jobTitle || job.title,
    jobLocation: b.jobLocation || job.location,
    job,
    student,
    status,
    rawStatus: b.status,
    createdAt,
    created_at: createdAt,
  }
}

/**
 * Parse human readable error message from API response
 */
export const formatErrorMessage = (errorData, status) => {
  if (!errorData) {
    return `Server error (${status || 'Unknown'})`
  }

  // Handle Spring Boot validation errors map: { field: "message", ... }
  if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
    const fieldErrors = Object.entries(errorData.errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(' | ')
    if (fieldErrors) return fieldErrors
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
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

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
      responseData = text ? { message: text } : null
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
   * Health Check: GET http://localhost:8080/health
   */
  async checkHealth() {
    const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
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
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      skipAuth: true,
    })
    const token = res.token || res.access_token
    return {
      ...res,
      token,
      access_token: token,
      user: normalizeUser(res.user),
    }
  },

  /**
   * Auth: Register
   */
  async register({ name, email, password, role }) {
    const normalizedRole = typeof role === 'string' ? role.trim().toUpperCase() : role
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: normalizedRole,
      }),
      skipAuth: true,
    })
    const token = res.token || res.access_token
    return {
      ...res,
      token,
      access_token: token,
      user: normalizeUser(res.user),
    }
  },

  /**
   * Auth: Get Current Profile
   */
  async getMe() {
    const res = await request('/auth/me', {
      method: 'GET',
    })
    return normalizeUser(res)
  },

  /**
   * Jobs: Public list of published jobs
   */
  async getJobs({ category, location, skip = 0, limit = 50, page, size } = {}) {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (location) params.append('location', location)

    const pageNum = page !== undefined ? page : (limit ? Math.floor(skip / limit) : 0)
    const pageSize = size !== undefined ? size : limit
    if (pageNum !== undefined) params.append('page', pageNum)
    if (pageSize !== undefined) params.append('size', pageSize)
    if (skip !== undefined) params.append('skip', skip)
    if (limit !== undefined) params.append('limit', limit)

    const queryString = params.toString() ? `?${params.toString()}` : ''
    const res = await request(`/jobs${queryString}`, {
      method: 'GET',
      skipAuth: true,
    })
    const items = Array.isArray(res) ? res : (res?.content || [])
    return items.map(normalizeJob)
  },

  /**
   * Jobs: Get single published job details
   */
  async getJob(jobId) {
    const res = await request(`/jobs/${jobId}`, {
      method: 'GET',
      skipAuth: true,
    })
    return normalizeJob(res)
  },

  /**
   * Student: Book a vacancy
   */
  async bookJob(jobId) {
    const res = await request(`/jobs/${jobId}/bookings`, {
      method: 'POST',
    })
    return normalizeBooking(res)
  },

  /**
   * Student: Get my bookings
   */
  async getMyBookings({ skip = 0, limit = 50, page, size } = {}) {
    const params = new URLSearchParams()
    const pageNum = page !== undefined ? page : (limit ? Math.floor(skip / limit) : 0)
    const pageSize = size !== undefined ? size : limit
    if (pageNum !== undefined) params.append('page', pageNum)
    if (pageSize !== undefined) params.append('size', pageSize)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const res = await request(`/bookings/me${qs}`, {
      method: 'GET',
    })
    const items = Array.isArray(res) ? res : (res?.content || [])
    return items.map(normalizeBooking)
  },

  /**
   * Employer: Create a job vacancy
   */
  async createJob(jobData) {
    const payload = {
      title: jobData.title,
      description: jobData.description,
      category: jobData.category,
      location: jobData.location,
      payAmount: jobData.payAmount !== undefined ? Number(jobData.payAmount) : Number(jobData.pay_amount),
      payUnit: jobData.payUnit || jobData.pay_unit,
      startsAt: jobData.startsAt || jobData.starts_at,
      endsAt: jobData.endsAt || jobData.ends_at,
      capacity: Number(jobData.capacity),
    }
    const res = await request('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return normalizeJob(res)
  },

  /**
   * Employer: Get jobs created by current employer
   */
  async getEmployerJobs({ skip = 0, limit = 50, page, size } = {}) {
    const params = new URLSearchParams()
    const pageNum = page !== undefined ? page : (limit ? Math.floor(skip / limit) : 0)
    const pageSize = size !== undefined ? size : limit
    if (pageNum !== undefined) params.append('page', pageNum)
    if (pageSize !== undefined) params.append('size', pageSize)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const res = await request(`/employer/jobs${qs}`, {
      method: 'GET',
    })
    const items = Array.isArray(res) ? res : (res?.content || [])
    return items.map(normalizeJob)
  },

  /**
   * Employer: View bookings / applicants for own job
   */
  async getJobBookings(jobId, { skip = 0, limit = 50, page, size } = {}) {
    const params = new URLSearchParams()
    const pageNum = page !== undefined ? page : (limit ? Math.floor(skip / limit) : 0)
    const pageSize = size !== undefined ? size : limit
    if (pageNum !== undefined) params.append('page', pageNum)
    if (pageSize !== undefined) params.append('size', pageSize)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const res = await request(`/employer/jobs/${jobId}/bookings${qs}`, {
      method: 'GET',
    })
    const items = Array.isArray(res) ? res : (res?.content || [])
    return items.map(normalizeBooking)
  },

  /**
   * Admin: Get pending employers
   */
  async getPendingEmployers({ skip = 0, limit = 50, page, size } = {}) {
    const params = new URLSearchParams()
    const pageNum = page !== undefined ? page : (limit ? Math.floor(skip / limit) : 0)
    const pageSize = size !== undefined ? size : limit
    if (pageNum !== undefined) params.append('page', pageNum)
    if (pageSize !== undefined) params.append('size', pageSize)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const res = await request(`/admin/employers/pending${qs}`, {
      method: 'GET',
    })
    const items = Array.isArray(res) ? res : (res?.content || [])
    return items.map(normalizeUser)
  },

  /**
   * Admin: Approve employer
   */
  async approveEmployer(userId) {
    const res = await request(`/admin/employers/${userId}/approve`, {
      method: 'PATCH',
    })
    return normalizeUser(res)
  },

  /**
   * Admin: Get pending jobs
   */
  async getPendingJobs({ skip = 0, limit = 50, page, size } = {}) {
    const params = new URLSearchParams()
    const pageNum = page !== undefined ? page : (limit ? Math.floor(skip / limit) : 0)
    const pageSize = size !== undefined ? size : limit
    if (pageNum !== undefined) params.append('page', pageNum)
    if (pageSize !== undefined) params.append('size', pageSize)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const res = await request(`/admin/jobs/pending${qs}`, {
      method: 'GET',
    })
    const items = Array.isArray(res) ? res : (res?.content || [])
    return items.map(normalizeJob)
  },

  /**
   * Admin: Approve job
   */
  async approveJob(jobId) {
    const res = await request(`/admin/jobs/${jobId}/approve`, {
      method: 'PATCH',
    })
    return normalizeJob(res)
  },
}
