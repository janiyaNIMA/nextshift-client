import { useState, useEffect, useMemo, useCallback } from 'react'
import { ThemeContext } from './themeContextBase'
import { useAuth } from './useAuth'
import { createNextShiftTheme } from '../theme'
import { getCookie, setCookie } from '../utils/cookies'

const COOKIE_ACTIVE_THEME = 'nextshift_active_theme'
const COOKIE_USER_THEME_PREFIX = 'nextshift_theme_'

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

export function ThemeContextProvider({ children }) {
  const { user } = useAuth()
  const [mode, setModeState] = useState(getInitialThemeMode)

  // Listen to user sign-in / profile load for per-user cookie synchronization
  useEffect(() => {
    if (!user || !user.id) return

    const userCookieKey = `${COOKIE_USER_THEME_PREFIX}${user.id}`
    const savedUserMode = getCookie(userCookieKey)

    if (savedUserMode && VALID_THEME_MODES.includes(savedUserMode)) {
      if (savedUserMode !== mode) {
        setModeState(savedUserMode)
        setCookie(COOKIE_ACTIVE_THEME, savedUserMode)
      }
    } else {
      // First time this user logs in on this browser: initialize user cookie with active theme
      setCookie(userCookieKey, mode)
    }
  }, [user?.id])

  // Explicit user theme selection
  const setMode = useCallback((newMode) => {
    if (!VALID_THEME_MODES.includes(newMode)) return

    setModeState(newMode)
    setCookie(COOKIE_ACTIVE_THEME, newMode)

    if (user && user.id) {
      setCookie(`${COOKIE_USER_THEME_PREFIX}${user.id}`, newMode)
    }
  }, [user?.id])

  // Cycle through Light -> Dark -> High Contrast -> Light
  const cycleMode = useCallback(() => {
    const cycleMap = {
      light: 'dark',
      dark: 'highContrast',
      highContrast: 'light',
    }
    const nextMode = cycleMap[mode] || 'light'
    setMode(nextMode)
  }, [mode, setMode])

  const theme = useMemo(() => createNextShiftTheme(mode), [mode])

  const value = useMemo(() => ({
    mode,
    setMode,
    cycleMode,
    theme,
  }), [mode, setMode, cycleMode, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
