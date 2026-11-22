import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  Tooltip,
  Avatar,
  Container,
} from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import ContrastIcon from '@mui/icons-material/Contrast'
import SettingsIcon from '@mui/icons-material/Settings'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { useAuth } from '../context/useAuth'
import { useThemeMode } from '../context/useTheme'
import { useNotification } from '../context/useNotification'
import AuthModal from './AuthModal'
import SettingsModal from './SettingsModal'

export default function AuthLoginPage() {
  const { login, isLoading, healthStatus, checkHealth } = useAuth()
  const { mode, cycleMode } = useThemeMode()
  const { showError, showSuccess, showErrorDialog } = useNotification()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const handleLogin = async (loginEmail, loginPassword) => {
    const targetEmail = (loginEmail ?? email).trim()
    const targetPassword = loginPassword ?? password

    if (!targetEmail || !targetPassword) {
      const msg = 'Please enter both email address and password.'
      setErrorMessage(msg)
      showError(msg, { title: 'Missing Credentials' })
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      const user = await login(targetEmail, targetPassword)
      showSuccess(`Welcome back, ${user.name}! (${user.role})`)
    } catch (err) {
      const msg = err.message || 'Login failed. Please verify your credentials.'
      setErrorMessage(msg)
      showError(msg, { title: 'Sign In Failed' })

      // If backend appears completely offline, offer popup dialog with troubleshooting
      if (msg.includes('Cannot connect to NextShift API') || msg.includes('Unable to connect') || msg.includes('Network error')) {
        showErrorDialog({
          title: 'Backend Connection Failed',
          message: 'The frontend could not reach the NextShift API at http://localhost:8080.',
          details: err.message,
          actionLabel: 'Check Connection',
          onAction: () => checkHealth(),
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleLogin()
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
          gap: 1.5,
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary">
          Restoring your session...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 3 },
        position: 'relative',
      }}
    >
      {/* Top Controls: Health & Theme Mode */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          zIndex: 10,
        }}
      >
        {/* Backend Health Pill */}
        <Tooltip title={healthStatus.isOnline ? 'Backend Online (http://localhost:8080)' : 'Backend Offline - Click to re-check'}>
          <Chip
            size="small"
            icon={
              <FiberManualRecordIcon
                sx={{
                  fontSize: '12px !important',
                  color: (theme) => (healthStatus.isOnline ? `${theme.palette.success.main} !important` : `${theme.palette.error.main} !important`),
                }}
              />
            }
            label={healthStatus.isOnline ? 'API Online' : 'API Offline'}
            onClick={checkHealth}
            variant="outlined"
            sx={{
              cursor: 'pointer',
              borderColor: (theme) => (healthStatus.isOnline ? theme.palette.success.light : theme.palette.error.light),
              bgcolor: (theme) => (healthStatus.isOnline
                ? (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5')
                : (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2')),
            }}
          />
        </Tooltip>

        {/* Theme Cycle Button */}
        <Tooltip title={`Theme: ${mode === 'highContrast' ? 'High Contrast' : mode === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to cycle)`}>
          <IconButton onClick={cycleMode} color="inherit" sx={{ bgcolor: 'action.hover' }}>
            {mode === 'highContrast' ? (
              <ContrastIcon fontSize="small" />
            ) : mode === 'dark' ? (
              <DarkModeIcon fontSize="small" />
            ) : (
              <LightModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* API Settings Button */}
        <Tooltip title="API Settings">
          <IconButton onClick={() => setSettingsModalOpen(true)} color="inherit" sx={{ bgcolor: 'action.hover' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Login Card */}
      <Container maxWidth="xs" disableGutters>
        <Card
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 20px rgba(0,0,0,0.08)'),
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Brand Header */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  mb: 1.5,
                  boxShadow: 2,
                }}
              >
                <WorkIcon fontSize="medium" />
              </Avatar>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                NextShift
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
                Sign in to your campus account
              </Typography>
            </Box>

            {/* Inline Error Alert */}
            {errorMessage && (
              <Alert
                severity="error"
                onClose={() => setErrorMessage('')}
                sx={{ mb: 2.5, borderRadius: 2 }}
              >
                {errorMessage}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleFormSubmit} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  sx={{ py: 1.3, fontWeight: 700, fontSize: '1rem', mt: 1 }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            {/* Create Account Action */}
            <Box sx={{ mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Don't have an account yet?
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
                startIcon={<PersonAddIcon fontSize="small" />}
                onClick={() => setRegisterModalOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600, py: 1 }}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Registration / Create Account Modal */}
      <AuthModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccessNotification={(msg) => showSuccess(msg)}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </Box>
  )
}
