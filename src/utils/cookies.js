/**
 * Cookie Utilities for NextShift
 * Provides safe cookie manipulation with SameSite and HTTPS Secure attributes.
 */

export const ACTIVE_THEME_COOKIE = 'nextshift_active_theme'

export const getUserThemeCookieName = (userId) => {
  if (!userId) return null
  return `nextshift_theme_${userId}`
}

/**
 * Get cookie value by name
 * @param {string} name
 * @returns {string|null}
 */
export function getCookie(name) {
  if (typeof document === 'undefined' || !name) {
    return null
  }

  const encodedName = encodeURIComponent(name)
  const cookies = document.cookie ? document.cookie.split(';') : []

  for (const rawCookie of cookies) {
    const trimmed = rawCookie.trim()
    if (trimmed.startsWith(`${encodedName}=`)) {
      const value = trimmed.slice(encodedName.length + 1)
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }

  return null
}

/**
 * Set a cookie with expiration, path, and security flags
 * @param {string} name
 * @param {string} value
 * @param {number} [days=365]
 */
export function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined' || !name) {
    return
  }

  const maxAgeSeconds = Math.floor(days * 24 * 60 * 60)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureFlag = isHttps ? '; Secure' : ''

  const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`
  document.cookie = cookieString
}

/**
 * Delete a cookie by setting max-age to 0
 * @param {string} name
 */
export function deleteCookie(name) {
  if (typeof document === 'undefined' || !name) {
    return
  }
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`
}
