import { useContext } from 'react'
import { ThemeContext } from './themeContextBase'

export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider')
  }
  return context
}

export const useTheme = useThemeMode
