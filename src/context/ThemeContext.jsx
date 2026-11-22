import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ThemeContext,
  COOKIE_ACTIVE_THEME,
  COOKIE_USER_THEME_PREFIX,
  VALID_THEME_MODES,
  getInitialThemeMode,
} from './themeContextBase'
import { useAuth } from './useAuth'
import { createNextShiftTheme } from '../theme'
import { getCookie, setCookie } from '../utils/cookies'

export function ThemeContextProvider({ children }) {
  const { user } = useAuth()
  const [mode, setModeState] = useState(getInitialThemeMode)

  const activeUserId = user?.id

  // Listen to user sign-in / profile load for per-user cookie synchronization
  useEffect(() => {
    if (!activeUserId) return

    const userCookieKey = `${COOKIE_USER_THEME_PREFIX}${activeUserId}`
    const savedUserMode = getCookie(userCookieKey)

    if (savedUserMode && VALID_THEME_MODES.includes(savedUserMode)) {
      setModeState((currentMode) => {
        if (savedUserMode !== currentMode) {
          setCookie(COOKIE_ACTIVE_THEME, savedUserMode)
          return savedUserMode
        }
        return currentMode
      })
    } else {
      // First time this user logs in on this browser: initialize user cookie with active theme
      setModeState((currentMode) => {
        setCookie(userCookieKey, currentMode)
        return currentMode
      })
    }
  }, [activeUserId])

  // Explicit user theme selection
  const setMode = useCallback((newMode) => {
    if (!VALID_THEME_MODES.includes(newMode)) return

    setModeState(newMode)
    setCookie(COOKIE_ACTIVE_THEME, newMode)

    if (activeUserId) {
      setCookie(`${COOKIE_USER_THEME_PREFIX}${activeUserId}`, newMode)
    }
  }, [activeUserId])

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
