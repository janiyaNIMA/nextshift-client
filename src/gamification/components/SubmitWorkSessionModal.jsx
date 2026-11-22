import { useState, useEffect } from 'react'
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
  CircularProgress,
  Chip,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StarsIcon from '@mui/icons-material/Stars'
import { api } from '../../services/api'
import { useNotification } from '../../context/useNotification'

export default function SubmitWorkSessionModal({ open, onClose, booking, onSubmitted }) {
  const { showError, showSuccess } = useNotification()

  const [startedAt, setStartedAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Pre-populate timestamps with shift scheduled start and end if available
  useEffect(() => {
    if (booking?.job) {
      const formatForInput = (iso) => {
        if (!iso) return ''
        const d = new Date(iso)
        if (isNaN(d.getTime())) return ''
        const pad = (n) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }

      setStartedAt(formatForInput(booking.job.starts_at || booking.job.startsAt))
      setEndedAt(formatForInput(booking.job.ends_at || booking.job.endsAt))
      setNotes('')
      setError('')
    }
  }, [booking])

  // Calculate elapsed duration and points preview
  let durationMinutes = 0
  let hours = 0
  let mins = 0
  let estimatedPoints = 0

  if (startedAt && endedAt) {
    const s = new Date(startedAt).getTime()
    const e = new Date(endedAt).getTime()
    if (!isNaN(s) && !isNaN(e) && e > s) {
      durationMinutes = Math.floor((e - s) / 60000)
      hours = Math.floor(durationMinutes / 60)
      mins = durationMinutes % 60
      estimatedPoints = Math.floor(durationMinutes / 60)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!startedAt || !endedAt) {
      setError('Please provide both shift start and end times.')
      return
    }

    const s = new Date(startedAt)
    const eTime = new Date(endedAt)

    if (isNaN(s.getTime()) || isNaN(eTime.getTime())) {
      setError('Invalid date format provided.')
      return
    }

    if (!s < eTime && s.getTime() >= eTime.getTime()) {
      setError('Start time must be before end time.')
      return
    }

    if (durationMinutes <= 0) {
      setError('Duration must be greater than zero minutes.')
      return
    }

    if (durationMinutes > 1440) {
      setError('Duration cannot exceed 24 hours for a single shift session.')
      return
    }

    setSubmitting(true)
    try {
      await api.submitWorkSession(booking.id, {
        startedAt: s.toISOString(),
        endedAt: eTime.toISOString(),
        notes: notes.trim(),
      })
      showSuccess('Work session submitted for employer confirmation!')
      if (onSubmitted) onSubmitted()
      onClose()
    } catch (err) {
      const msg = err.message || 'Failed to submit work session'
      setError(msg)
      showError(msg, { title: 'Submission Failed' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!booking) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Log Completed Shift
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Shift Context Card */}
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {booking.job?.title || 'Campus Shift'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                Category: {booking.job?.category} • Location: {booking.job?.location}
              </Typography>
            </Box>

            {/* Time Pickers */}
            <TextField
              label="Actual Start Time"
              type="datetime-local"
              required
              fullWidth
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
            />

            <TextField
              label="Actual End Time"
              type="datetime-local"
              required
              fullWidth
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={submitting}
            />

            {/* Duration and Points Preview Pill */}
            {durationMinutes > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff'),
                  border: 1,
                  borderColor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Duration: {hours}h {mins}m ({durationMinutes} total mins)
                  </Typography>
                </Box>
                <Chip
                  icon={<StarsIcon fontSize="small" />}
                  label={`+${estimatedPoints} pts`}
                  color="primary"
                  sx={{ fontWeight: 800 }}
                />
              </Box>
            )}

            <TextField
              label="Shift Notes / Duties Performed (Optional)"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief description of work done..."
              disabled={submitting}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={submitting || durationMinutes <= 0}
        >
          {submitting ? <CircularProgress size={20} /> : 'Submit for Employer Verification'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
