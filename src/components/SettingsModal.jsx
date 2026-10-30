import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useAuth } from '../context/useAuth'

export default function SettingsModal({ open, onClose }) {
  const { apiUrl, changeApiUrl, healthStatus, checkHealth, token } = useAuth()
  const [urlInput, setUrlInput] = useState(apiUrl)
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleSave = () => {
    changeApiUrl(urlInput.trim())
    setFeedback({ type: 'success', message: 'API Base URL saved successfully.' })
  }

  const handleTestConnection = async () => {
    setIsChecking(true)
    setFeedback(null)
    try {
      const ok = await checkHealth()
      if (ok) {
        setFeedback({ type: 'success', message: 'Successfully connected to backend /health!' })
      } else {
        setFeedback({ type: 'error', message: 'Backend unreachable. Make sure uvicorn is running on port 8000.' })
      }
    } finally {
      setIsChecking(false)
    }
  }

  const handleReset = () => {
    const defaultUrl = 'http://localhost:8000/api/v1'
    setUrlInput(defaultUrl)
    changeApiUrl(defaultUrl)
    setFeedback({ type: 'info', message: 'Reset to default API URL.' })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>NextShift API Configuration</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {feedback && (
            <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Backend Health Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={healthStatus.isOnline ? <CheckCircleIcon /> : <ErrorIcon />}
                label={healthStatus.isOnline ? 'Online (HTTP 200)' : 'Offline / Error'}
                color={healthStatus.isOnline ? 'success' : 'error'}
                variant="outlined"
              />
              <Button size="small" onClick={handleTestConnection} disabled={isChecking}>
                {isChecking ? <CircularProgress size={16} /> : 'Test /health'}
              </Button>
            </Box>
            {healthStatus.error && (
              <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                {healthStatus.error}
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              API Base URL
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Endpoints will be requested relative to this base path.
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:8000/api/v1"
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button variant="contained" size="small" onClick={handleSave}>
                Save URL
              </Button>
              <Button variant="outlined" size="small" color="inherit" onClick={handleReset}>
                Reset to Default
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Authentication State
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {token ? `JWT Token stored (${token.substring(0, 15)}...)` : 'No active session token.'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
