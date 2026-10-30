import { Box, CircularProgress, Typography } from '@mui/material'
import { AppProvider } from '@toolpad/core/AppProvider'
import { SignInPage } from '@toolpad/core/SignInPage'
import { useAuth } from '../context/useAuth'
import { theme } from '../theme'

const providers = [{ id: 'credentials', name: 'Email and Password' }]

export default function AuthLoginPage() {
  const { login, isLoading } = useAuth()

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
    </AppProvider>
  )
}
