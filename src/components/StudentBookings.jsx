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
  LinearProgress,
  Stack,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ScienceIcon from '@mui/icons-material/Science'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import StarsIcon from '@mui/icons-material/Stars'
import { api } from '../services/api'
import { normalizeGamificationSummary } from '../gamification/types/gamification'
import ElementJourneyModal from '../gamification/components/ElementJourneyModal'
import SubmitWorkSessionModal from '../gamification/components/SubmitWorkSessionModal'

export default function StudentBookings({ onBrowseJobs }) {
  const [bookings, setBookings] = useState([])
  const [gamification, setGamification] = useState(null)
  const [workSessionsByBooking, setWorkSessionsByBooking] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [journeyModalOpen, setJourneyModalOpen] = useState(false)
  const [selectedBookingForSession, setSelectedBookingForSession] = useState(null)

  const loadGamification = useCallback(async () => {
    try {
      const summary = await api.getGamificationSummary()
      if (summary) {
        setGamification(normalizeGamificationSummary(summary))
      }
    } catch (err) {
      console.warn('Could not load student gamification summary:', err)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bookingsData] = await Promise.all([
        api.getMyBookings({ limit: 50 }),
        loadGamification(),
      ])
      const items = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.content || [])
      setBookings(items)

      // Fetch work sessions for bookings to display status
      const sessionsMap = {}
      await Promise.allSettled(
        items.map(async (b) => {
          try {
            const sessions = await api.getWorkSessionsForBooking(b.id)
            if (Array.isArray(sessions) && sessions.length > 0) {
              sessionsMap[b.id] = sessions[0] // Most recent session
            }
          } catch {
            // ignore individual session load errors
          }
        })
      )
      setWorkSessionsByBooking(sessionsMap)
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }, [loadGamification])

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

  const currentTier = gamification?.currentTier
  const nextTier = gamification?.nextTier

  return (
    <Box sx={{ py: 3 }}>
      {/* Gamification Element Journey Hero Banner */}
      {gamification && (
        <Card
          sx={(theme) => ({
            p: { xs: 2, sm: 2.5 },
            mb: 4,
            borderRadius: 3,
            bgcolor: theme.palette.mode === 'highContrast' ? '#0a0a0a' : 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: (t) => (t.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)'),
          })}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                  }}
                >
                  {currentTier ? currentTier.symbol : '?'}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {currentTier ? `${currentTier.elementName} (${currentTier.tierCode})` : 'Starter (Unranked)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    NextShift Element Journey • 1 verified working hour = 1 point
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {gamification.totalPoints} Total Points
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {gamification.progressPercent.toFixed(1)}% to {nextTier ? nextTier.tierCode : 'Max Tier'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={gamification.progressPercent}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ScienceIcon />}
                onClick={() => setJourneyModalOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                View Element Journey
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Bookings Section Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Booked Shifts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of your confirmed campus shifts, submit completed hours, and earn points
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
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: 'action.hover' }} elevation={0}>
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
            const workSession = workSessionsByBooking[booking.id]

            return (
              <Grid item xs={12} md={6} key={booking.id}>
                <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Booking #{booking.id} • Booked {formatDateTime(booking.created_at || booking.createdAt)}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                          {job.title || `Job #${booking.job_id || booking.jobId}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={booking.status || 'confirmed'}
                        color={booking.status?.toLowerCase() === 'confirmed' ? 'success' : 'default'}
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
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
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
                    </Box>

                    {/* Gamification Work Session Logging Status */}
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase' }}>
                        Element Journey Work Verification
                      </Typography>

                      {!workSession ? (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<StarsIcon />}
                          onClick={() => setSelectedBookingForSession(booking)}
                          sx={{ borderRadius: 2 }}
                        >
                          Log Completed Shift (Earn Points)
                        </Button>
                      ) : workSession.status?.toUpperCase() === 'CONFIRMED' ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={`Verified (${workSession.verifiedMinutes || workSession.verified_minutes} mins • +${Math.floor((workSession.verifiedMinutes || workSession.verified_minutes) / 60)} pts earned)`}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>
                      ) : workSession.status?.toUpperCase() === 'REJECTED' ? (
                        <Chip
                          label={`Session Rejected: ${workSession.notes || 'Please contact employer'}`}
                          color="error"
                          size="small"
                        />
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            icon={<HourglassEmptyIcon />}
                            label={`Submitted (${workSession.verifiedMinutes || workSession.verified_minutes} mins) • Awaiting Employer Confirmation`}
                            color="warning"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Element Journey Progression Modal */}
      <ElementJourneyModal
        open={journeyModalOpen}
        onClose={() => setJourneyModalOpen(false)}
        initialSummary={gamification}
      />

      {/* Submit Completed Work Session Modal */}
      <SubmitWorkSessionModal
        open={Boolean(selectedBookingForSession)}
        onClose={() => setSelectedBookingForSession(null)}
        booking={selectedBookingForSession}
        onSubmitted={() => {
          fetchBookings()
          loadGamification()
        }}
      />
    </Box>
  )
}
