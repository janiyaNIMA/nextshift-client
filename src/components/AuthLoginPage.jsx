import { useState } from 'react'
import { Box, Button, CircularProgress, Typography, Stack, Chip } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import BusinessIcon from '@mui/icons-material/Business'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { AppProvider } from '@toolpad/core/AppProvider'
import { SignInPage } from '@toolpad/core/SignInPage'
import { useAuth } from '../context/useAuth'
import { theme } from '../theme'
import AuthModal from './AuthModal'

const providers = [{ id: 'credentials', name: 'Email and Password' }]

export default function AuthLoginPage() {
  const { login, isLoading } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [quickLoginError, setQuickLoginError] = useState(null)

  const handleQuickLogin = async (email, password) => {
    setQuickLoginError(null)
    try {
      await login(email, password)
    } catch (err) {
      setQuickLoginError(err.message || 'Quick login failed')
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          bgcolor: '#f8fafc',
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Restoring your session...
        </Typography>
      </Box>
    )
  }

  return (
    <AppProvider
      theme={theme}
      branding={{
        title: 'NextShift',
      }}
    >
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SignInPage
          providers={providers}
          signIn={async (provider, formData) => {
            if (provider.id !== 'credentials') {
              return {
                error: 'Unsupported authentication provider.',
                type: 'UnknownError',
              }
            }

            const email = String(formData?.get('email') || '').trim()
            const password = String(formData?.get('password') || '')

            if (!email || !password) {
              return {
                error: 'Email and password are required.',
                type: 'CredentialsSignin',
              }
            }

            try {
              await login(email, password)
              return {}
            } catch (err) {
              return {
                error: err?.message || 'Sign in failed. Please check your credentials.',
                type: err?.type || 'CredentialsSignin',
              }
            }
          }}
          slotProps={{
            emailField: { autoFocus: true },
            form: { noValidate: true },
            submitButton: { variant: 'contained', color: 'primary' },
          }}
        />

        <Box sx={{ mt: -4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          {quickLoginError && (
            <Typography variant="caption" color="error.main">
              {quickLoginError}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            Quick demo sign-in:
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Chip
              icon={<SchoolIcon fontSize="small" />}
              label="Student"
              size="small"
              variant="outlined"
              color="info"
              onClick={() => handleQuickLogin('student@example.com', 'Student1234!')}
              clickable
            />
            <Chip
              icon={<BusinessIcon fontSize="small" />}
              label="Employer"
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => handleQuickLogin('employer@example.com', 'Employer1234!')}
              clickable
            />
            <Chip
              icon={<SupervisorAccountIcon fontSize="small" />}
              label="Admin"
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => handleQuickLogin('admin@example.com', 'AdminSecurePassword123!')}
              clickable
            />
          </Stack>

          <Button
            size="small"
            startIcon={<PersonAddIcon fontSize="small" />}
            onClick={() => setModalOpen(true)}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Don't have an account? Register or Switch Login
          </Button>
        </Box>

        <AuthModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccessNotification={() => {}}
        />
      </Box>
    </AppProvider>
  )
}
