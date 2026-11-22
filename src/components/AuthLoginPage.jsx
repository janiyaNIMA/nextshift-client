import { useState } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { AppProvider } from '@toolpad/core/AppProvider'
import { SignInPage } from '@toolpad/core/SignInPage'
import { useAuth } from '../context/useAuth'
import { useNotification } from '../context/useNotification'
import { theme } from '../theme'
import AuthModal from './AuthModal'

const providers = [{ id: 'credentials', name: 'Email and Password' }]

export default function AuthLoginPage() {
  const { login, isLoading } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [authModalOpen, setAuthModalOpen] = useState(false)

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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SignInPage
          providers={providers}
          signIn={async (provider, formData) => {
            if (provider.id !== 'credentials') {
              const err = 'Unsupported authentication provider.'
              showError(err, 'Authentication Provider Error')
              return {
                error: err,
                type: 'UnknownError',
              }
            }

            const email = String(formData?.get('email') || '').trim()
            const password = String(formData?.get('password') || '')

            if (!email || !password) {
              const err = 'Email and password are required.'
              showError(err, 'Missing Credentials')
              return {
                error: err,
                type: 'CredentialsSignin',
              }
            }

            try {
              const loggedUser = await login(email, password)
              showSuccess(`Welcome back, ${loggedUser.name}!`)
              return {}
            } catch (err) {
              const errorMsg = err?.message || 'Sign in failed. Please check your credentials.'
              showError(errorMsg, 'Login Failed')
              return {
                error: errorMsg,
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

        <Box sx={{ pb: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="text"
            color="primary"
            onClick={() => setAuthModalOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Don't have an account or want quick-fill test credentials? Click here
          </Button>
        </Box>

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccessNotification={(msg) => showSuccess(msg)}
        />
      </Box>
    </AppProvider>
  )
}

