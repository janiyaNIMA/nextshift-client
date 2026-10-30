import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { api } from '../services/api'

export default function StudentBookings({ onBrowseJobs }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getMyBookings({ limit: 50 })
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    try {
      return new Date(isoString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Booked Shifts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of your confirmed campus shifts and work schedules
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBookings}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
          <EventAvailableIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No booked shifts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't signed up for any campus shifts yet. Browse open shifts to get started!
          </Typography>
          <Button variant="contained" color="primary" onClick={onBrowseJobs}>
            Browse Available Shifts
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {bookings.map((booking) => {
            const job = booking.job || {}
            return (
              <Grid item xs={12} md={6} key={booking.id}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Booking #{booking.id} • Booked {formatDateTime(booking.created_at)}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                          {job.title || `Job #${booking.job_id}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={booking.status || 'confirmed'}
                        color={booking.status === 'confirmed' ? 'success' : 'default'}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </Box>

                    {job.category && (
                      <Chip label={job.category} size="small" variant="outlined" color="primary" sx={{ mb: 2 }} />
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {job.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2">{job.location}</Typography>
                        </Box>
                      )}

                      {job.pay_amount !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" color="success" />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                            ${job.pay_amount?.toFixed(2)} / {job.pay_unit?.replace('_', ' ')}
                          </Typography>
                        </Box>
                      )}

                      {job.starts_at && job.ends_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(job.starts_at)} – {formatDateTime(job.ends_at)}
                          </Typography>
                        </Box>
                      )}

                      {job.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: '#f8fafc',
                            borderRadius: 1.5,
                            border: '1px solid #e2e8f0',
                            display: 'block',
                          }}
                        >
                          {job.description}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}
