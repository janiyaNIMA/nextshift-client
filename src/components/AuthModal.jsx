import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
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
  IconButton,
  Avatar,
} from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import BusinessIcon from '@mui/icons-material/Business'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth } from '../context/useAuth'
import { useNotification } from '../context/useNotification'

export default function AuthModal({ open, onClose, onSuccessNotification }) {
  const { login, register } = useAuth()
  const { showError, showSuccess } = useNotification()

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('student') // 'student' or 'employer'

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const name = regName.trim()
    const email = regEmail.trim()
    const password = regPassword

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      const user = await register({
        name,
        email,
        password,
        role: regRole,
      })

      // Attempt automatic sign-in after account creation
      try {
        await login(email, password)
        if (regRole === 'employer') {
          const msg = 'Employer account registered! Your account is pending admin approval before posting shifts.'
          if (onSuccessNotification) onSuccessNotification(msg)
          else showSuccess(msg)
        } else {
          const msg = `Account registered successfully! Welcome to NextShift, ${user?.name || name}.`
          if (onSuccessNotification) onSuccessNotification(msg)
          else showSuccess(msg)
        }
        onClose()
      } catch {
        const msg = 'Account created successfully! Please sign in with your credentials.'
        if (onSuccessNotification) onSuccessNotification(msg)
        else showSuccess(msg)
        onClose()
      }
    } catch (err) {
      const msg = err.message || 'Registration failed'
      setErrorMessage(msg)
      showError(msg, { title: 'Registration Failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>
            <PersonAddIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Create Account
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Join NextShift as a Student or Employer
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

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
              <Alert severity="info" variant="outlined" sx={{ py: 0.5, borderRadius: 2 }}>
                Employer accounts start as <strong>pending approval</strong> until an admin approves your profile.
              </Alert>
            ) : (
              <Alert severity="success" variant="outlined" sx={{ py: 0.5, borderRadius: 2 }}>
                Students are approved immediately upon registration to book shifts.
              </Alert>
            )}

            <TextField
              label="Full Name"
              required
              fullWidth
              autoFocus
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Jane Doe"
              disabled={loading}
            />

            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="name@university.edu"
              disabled={loading}
            />

            <TextField
              label="Password (min 8 characters)"
              type="password"
              required
              fullWidth
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              inputProps={{ minLength: 8 }}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.3, fontWeight: 700, mt: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 500 }}>
          Already have an account? Sign In
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
