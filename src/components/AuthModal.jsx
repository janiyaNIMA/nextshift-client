import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  CircularProgress,
  Stack,
  Divider,
  Chip,
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import BusinessIcon from '@mui/icons-material/Business'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import { useAuth } from '../context/useAuth'

export default function AuthModal({ open, onClose, onSuccessNotification }) {
  const { login, register } = useAuth()
  const [tabIndex, setTabIndex] = useState(0) // 0: Login, 1: Register

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('student') // 'student' or 'employer'

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex)
    setErrorMessage('')
  }

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setLoginEmail('admin@example.com')
      setLoginPassword('AdminSecurePassword123!')
    } else if (role === 'student') {
      setLoginEmail('student@example.com')
      setLoginPassword('Student1234!')
    } else if (role === 'employer') {
      setLoginEmail('employer@example.com')
      setLoginPassword('Employer1234!')
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)
    try {
      const user = await login(loginEmail, loginPassword)
      onSuccessNotification(`Welcome back, ${user.name}! (${user.role})`)
      onClose()
    } catch (err) {
      setErrorMessage(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)
    try {
      const user = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      })
      // If student, automatically log in; if employer, let them know approval status
      try {
        await login(regEmail, regPassword)
        if (regRole === 'employer') {
          onSuccessNotification(`Employer registered! Your account is pending admin approval before posting shifts.`)
        } else {
          onSuccessNotification(`Account registered successfully! Welcome ${user.name}.`)
        }
        onClose()
      } catch {
        onSuccessNotification(`Account registered! Please sign in with your credentials.`)
        setTabIndex(0)
        setLoginEmail(regEmail)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Sign In" />
          <Tab label="Create Account" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {tabIndex === 0 ? (
          // ================= LOGIN FORM =================
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="user@example.com"
                autoFocus
              />

              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Stack>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Quick Test Credentials
              </Typography>
            </Divider>

            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
              <Chip
                icon={<SupervisorAccountIcon fontSize="small" />}
                label="Admin"
                size="small"
                variant="outlined"
                onClick={() => handleQuickFill('admin')}
                clickable
                color="secondary"
              />
              <Chip
                icon={<SchoolIcon fontSize="small" />}
                label="Student"
                size="small"
                variant="outlined"
                onClick={() => handleQuickFill('student')}
                clickable
                color="info"
              />
              <Chip
                icon={<BusinessIcon fontSize="small" />}
                label="Employer"
                size="small"
                variant="outlined"
                onClick={() => handleQuickFill('employer')}
                clickable
                color="warning"
              />
            </Stack>
          </Box>
        ) : (
          // ================= REGISTER FORM =================
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2.5}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>
                  I want to register as:
                </FormLabel>
                <RadioGroup
                  row
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel
                    value="student"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SchoolIcon fontSize="small" color="info" />
                        <Typography variant="body2">Student (Immediate access)</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="employer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon fontSize="small" color="warning" />
                        <Typography variant="body2">Employer (Requires admin approval)</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {regRole === 'employer' ? (
                <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                  Employer accounts start as <strong>pending approval</strong> until an admin approves your profile.
                </Alert>
              ) : (
                <Alert severity="success" variant="outlined" sx={{ py: 0.5 }}>
                  Students are approved immediately upon registration to book shifts.
                </Alert>
              )}

              <TextField
                label="Full Name"
                required
                fullWidth
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jane Doe"
              />

              <TextField
                label="Email Address"
                type="email"
                required
                fullWidth
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jane@example.com"
                helperText="Use standard domains (e.g., example.com)"
              />

              <TextField
                label="Password (min 8 characters)"
                type="password"
                required
                fullWidth
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                inputProps={{ minLength: 8 }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
