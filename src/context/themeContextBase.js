import { createContext } from 'react'
import { getCookie } from '../utils/cookies'

export const ThemeContext = createContext(null)

export const COOKIE_ACTIVE_THEME = 'nextshift_active_theme'
export const COOKIE_USER_THEME_PREFIX = 'nextshift_theme_'
export const VALID_THEME_MODES = ['light', 'dark', 'highContrast']

export function getInitialThemeMode() {
  const savedActive = getCookie(COOKIE_ACTIVE_THEME)
  if (savedActive && VALID_THEME_MODES.includes(savedActive)) {
    return savedActive
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return 'light'
}
