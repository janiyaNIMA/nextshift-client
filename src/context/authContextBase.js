import { createContext } from 'react'

export const AuthContext = createContext(null)

export const normalizeUser = (userData) => {
  if (!userData) return null
  return {
    ...userData,
    role: typeof userData.role === 'string' ? userData.role.toLowerCase() : userData.role,
    is_approved: userData.is_approved ?? userData.approved ?? false,
    is_active: userData.is_active ?? userData.active ?? false,
  }
}
