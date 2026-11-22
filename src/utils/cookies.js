/**
 * Browser cookie helper utilities for NextShift theme persistence.
 *
 * Implements:
 * - nextshift_active_theme: Active global/guest theme ('light' | 'dark' | 'highContrast')
 * - nextshift_theme_${userId}: Per-user theme preference stored across sessions
 */

export function getCookie(name) {
  if (typeof document === 'undefined') return null
  const nameEQ = encodeURIComponent(name) + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length))
      } catch {
        return c.substring(nameEQ.length, c.length)
      }
    }
  }
  return null
}

export function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureFlag = isSecure ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax${secureFlag}`
}

export function deleteCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; SameSite=Lax`
}
