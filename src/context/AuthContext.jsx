import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './authContextBase'
import { api, getToken, setToken, removeToken, getApiBaseUrl, setApiBaseUrl } from '../services/api'

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl())
  const [healthStatus, setHealthStatus] = useState({ checked: false, isOnline: false, info: null, error: null })

  // Check backend server health
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.checkHealth()
      setHealthStatus({ checked: true, isOnline: true, info: data, error: null })
      return true
    } catch (err) {
      setHealthStatus({ checked: true, isOnline: false, info: null, error: err.message })
      return false
    }
  }, [])

  // Load current user profile if token exists
  const loadUser = useCallback(async () => {
    const currentToken = getToken()
    if (!currentToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const profile = await api.getMe()
      setUser(profile)
    } catch (err) {
      // If 401 Unauthorized, token expired or invalid
      if (err.status === 401) {
        removeToken()
        setTokenState(null)
        setUser(null)
      } else {
        console.error('Failed to fetch user profile:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    checkHealth()
    loadUser()
  }, [checkHealth, loadUser])

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const res = await api.login(email, password)
      setToken(res.access_token)
      setTokenState(res.access_token)

      // Fetch user info
      const profile = await api.getMe()
      setUser(profile)
      return profile
    } finally {
      setIsLoading(false)
    }
  }

  // Register handler
  const register = async ({ name, email, password, role }) => {
    setIsLoading(true)
    try {
      const registeredUser = await api.register({ name, email, password, role })
      return registeredUser
    } finally {
      setIsLoading(false)
    }
  }

  // Logout handler
  const logout = () => {
    removeToken()
    setTokenState(null)
    setUser(null)
  }

  // Update API URL
  const changeApiUrl = (newUrl) => {
    setApiBaseUrl(newUrl)
    setApiUrlState(newUrl)
    checkHealth()
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    healthStatus,
    checkHealth,
    refreshProfile: loadUser,
    login,
    register,
    logout,
    apiUrl,
    changeApiUrl,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
