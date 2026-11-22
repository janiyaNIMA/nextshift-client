import { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import { createNextShiftTheme } from '../theme'
import { getCookie, setCookie, ACTIVE_THEME_COOKIE, getUserThemeCookieName } from '../utils/cookies'
import { useAuth } from './useAuth'

export const ThemeContext = createContext({
  mode: 'light',
  setMode: () => {},
  cycleMode: () => {},
  theme: null,
})

export const ThemeModeContext = ThemeContext

const VALID_MODES = ['light', 'dark', 'highContrast']

/**
 * Determine initial theme mode from active cookie or system preference
 */
function getInitialMode() {
  const cookieMode = getCookie(ACTIVE_THEME_COOKIE)
  if (cookieMode && VALID_MODES.includes(cookieMode)) {
    return cookieMode
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }

  return 'light'
}

export function ThemeContextProvider({ children }) {
  const { user } = useAuth()
  const [mode, setModeState] = useState(getInitialMode)

  // Synchronize when authenticated user changes
  useEffect(() => {
    if (!user?.id) return

    const userCookieKey = getUserThemeCookieName(user.id)
    const userTheme = getCookie(userCookieKey)

    if (userTheme && VALID_MODES.includes(userTheme)) {
      if (userTheme !== mode) {
        setModeState(userTheme)
        setCookie(ACTIVE_THEME_COOKIE, userTheme)
      }
    } else {
      // First time this user logs in without a stored preference:
      // Adopt current active theme as their stored preference
      setCookie(userCookieKey, mode)
    }
  }, [user?.id, mode])

  const setMode = useCallback((newMode) => {
    if (!VALID_MODES.includes(newMode)) return

    setModeState(newMode)
    setCookie(ACTIVE_THEME_COOKIE, newMode)

    if (user?.id) {
      const userCookieKey = getUserThemeCookieName(user.id)
      setCookie(userCookieKey, newMode)
    }
  }, [user?.id])

  const cycleMode = useCallback(() => {
    setModeState((currentMode) => {
      let nextMode = 'light'
      if (currentMode === 'light') nextMode = 'dark'
      else if (currentMode === 'dark') nextMode = 'highContrast'
      else nextMode = 'light'

      setCookie(ACTIVE_THEME_COOKIE, nextMode)
      if (user?.id) {
        const userCookieKey = getUserThemeCookieName(user.id)
        setCookie(userCookieKey, nextMode)
      }

      return nextMode
    })
  }, [user?.id])

  const theme = useMemo(() => createNextShiftTheme(mode), [mode])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      cycleMode,
      theme,
    }),
    [mode, setMode, cycleMode, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const ThemeModeProvider = ThemeContextProvider

export { useThemeMode } from './useThemeMode'
