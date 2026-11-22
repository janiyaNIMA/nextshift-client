import { createTheme, alpha } from '@mui/material/styles'

/**
 * Returns Material-UI theme options for Light, Dark, or High Contrast modes.
 * Adheres strictly to nextshift-client/ref.local/COLOR_PALETTE.md.
 */
export const getThemeTokens = (mode = 'light') => {
  const isHighContrast = mode === 'highContrast'
  const isDark = mode === 'dark' || isHighContrast

  return {
    palette: {
      mode: isDark ? 'dark' : 'light',
      themeMode: mode,
      ...(mode === 'light' && {
        primary: {
          main: '#2563eb', // Royal blue
          light: '#60a5fa',
          dark: '#1d4ed8',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#0d9488', // Emerald Teal
          light: '#2dd4bf',
          dark: '#0f766e',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
          subtle: '#f1f5f9',
        },
        text: {
          primary: '#0f172a',
          secondary: '#64748b',
          disabled: '#94a3b8',
        },
        divider: '#e2e8f0',
        success: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          contrastText: '#ffffff',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        info: {
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
          contrastText: '#ffffff',
        },
        action: {
          hover: '#f1f5f9',
          selected: alpha('#2563eb', 0.08),
        },
      }),
      ...(mode === 'dark' && {
        primary: {
          main: '#3b82f6', // Electric sky blue
          light: '#93c5fd',
          dark: '#1d4ed8',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#14b8a6', // Glowing teal
          light: '#5eead4',
          dark: '#0f766e',
          contrastText: '#ffffff',
        },
        background: {
          default: '#0b0f19', // Deep navy canvas
          paper: '#161f30',   // Deep slate paper
          subtle: '#1e293b',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          disabled: '#64748b',
        },
        divider: '#2a374a',
        success: {
          main: '#34d399',
          light: '#6ee7b7',
          dark: '#059669',
          contrastText: '#0f172a',
        },
        warning: {
          main: '#fbbf24',
          light: '#fde68a',
          dark: '#d97706',
          contrastText: '#0f172a',
        },
        error: {
          main: '#f87171',
          light: '#fca5a5',
          dark: '#dc2626',
          contrastText: '#ffffff',
        },
        info: {
          main: '#60a5fa',
          light: '#93c5fd',
          dark: '#2563eb',
          contrastText: '#0f172a',
        },
        action: {
          hover: alpha('#ffffff', 0.06),
          selected: alpha('#3b82f6', 0.16),
        },
      }),
      ...(mode === 'highContrast' && {
        primary: {
          main: '#facc15', // Vivid gold (15.2:1 contrast against black)
          light: '#fef08a',
          dark: '#ca8a04',
          contrastText: '#000000',
        },
        secondary: {
          main: '#38bdf8', // Luminous cyan (11.5:1 contrast against black)
          light: '#bae6fd',
          dark: '#0284c7',
          contrastText: '#000000',
        },
        background: {
          default: '#000000', // Pitch black
          paper: '#0a0a0a',
          subtle: '#171717',
        },
        text: {
          primary: '#ffffff', // 21:1 maximum luminance
          secondary: '#e2e8f0', // 17.1:1
          disabled: '#a3a3a3',
        },
        divider: '#ffffff', // Solid white divider
        success: {
          main: '#4ade80',
          light: '#86efac',
          dark: '#22c55e',
          contrastText: '#000000',
        },
        warning: {
          main: '#fbbf24',
          light: '#fde68a',
          dark: '#d97706',
          contrastText: '#000000',
        },
        error: {
          main: '#ff6b6b',
          light: '#fca5a5',
          dark: '#ef4444',
          contrastText: '#000000',
        },
        info: {
          main: '#38bdf8',
          light: '#7dd3fc',
          dark: '#0284c7',
          contrastText: '#000000',
        },
        action: {
          hover: alpha('#ffffff', 0.15),
          selected: alpha('#facc15', 0.25),
        },
      }),
    },
    typography: {
      fontFamily: ['Roboto', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 4,
            border: isHighContrast
              ? '2px solid #ffffff'
              : `1px solid ${theme.palette.divider}`,
            boxShadow: isHighContrast
              ? 'none'
              : isDark
                ? '0 4px 20px rgba(0,0,0,0.5)'
                : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            backgroundImage: 'none',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: () => ({
            backgroundImage: 'none',
            ...(isHighContrast && {
              border: '1px solid #ffffff',
            }),
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: isHighContrast ? 3 : 6,
            boxShadow: 'none',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              boxShadow: isHighContrast ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
            },
            ...(isHighContrast && {
              borderWidth: 2,
              '&:focus-visible': {
                outline: '3px solid #facc15',
                outlineOffset: 2,
              },
            }),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: () => ({
            borderRadius: isHighContrast ? 3 : 6,
            ...(isHighContrast && {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ffffff',
                borderWidth: 2,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#facc15',
                borderWidth: 2,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#facc15',
                borderWidth: 3,
              },
            }),
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: isHighContrast ? 3 : 6,
            ...(isHighContrast && {
              border: '1.5px solid currentColor',
            }),
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background?.subtle || (theme.palette.mode === 'dark' ? theme.palette.action.hover : '#f1f5f9'),
          }),
        },
      },
    },
  }
}

export const createNextShiftTheme = (mode = 'light') => createTheme(getThemeTokens(mode))

// Default export / fallback
export const theme = createNextShiftTheme('light')
