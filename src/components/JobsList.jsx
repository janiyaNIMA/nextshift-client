import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  InputAdornment,
  Paper,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CategoryIcon from '@mui/icons-material/Category'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import GroupIcon from '@mui/icons-material/Group'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { api } from '../services/api'
import { useAuth } from '../context/useAuth'

export default function JobsList({ onOpenAuth, showNotification }) {
  const { user, isAuthenticated } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getJobs({
        category: categoryFilter.trim() || undefined,
        location: locationFilter.trim() || undefined,
        limit: 50,
      })
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, locationFilter])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleBookJob = async (jobId) => {
    if (!isAuthenticated) {
      onOpenAuth()
      return
    }

    if (user?.role !== 'student') {
      showNotification('Only students can book shifts', 'warning')
      return
    }

    setBookingLoading(true)
    try {
      await api.bookJob(jobId)
      showNotification('Shift booked successfully! You can view it in My Bookings.', 'success')
      // Refresh job list to reflect updated capacity
      fetchJobs()
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(null)
      }
    } catch (err) {
      showNotification(err.message || 'Booking failed', 'error')
    } finally {
      setBookingLoading(false)
    }
  }

  // Format date time helper
  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  // Filter jobs locally by search query if set
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      job.title?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      job.category?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    )
  })

  return (
    <Box sx={{ py: 3 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.dark' }}>
          Find Campus Shifts & Part-time Work
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto' }}>
          Discover flexible on-campus and near-campus shifts posted by university departments and local employers.
        </Typography>
      </Box>

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Category (e.g. Technology)"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Location (e.g. Library)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={fetchJobs}
              startIcon={<RefreshIcon />}
              disabled={loading}
              sx={{ height: 40 }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchJobs}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredJobs.length === 0 ? (
        /* Empty State */
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No published shifts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {categoryFilter || locationFilter || searchQuery
              ? 'Try clearing your filters to see all available shifts.'
              : 'There are currently no active job vacancies available.'}
          </Typography>
          {(categoryFilter || locationFilter || searchQuery) && (
            <Button
              variant="outlined"
              onClick={() => {
                setCategoryFilter('')
                setLocationFilter('')
                setSearchQuery('')
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        /* Jobs Grid */
        <Grid container spacing={3}>
          {filteredJobs.map((job) => {
            const isFull = job.remaining_capacity !== undefined && job.remaining_capacity <= 0
            return (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Tags row */}
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<CategoryIcon fontSize="small" />}
                        label={job.category || 'General'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<LocationOnIcon fontSize="small" />}
                        label={job.location}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    {/* Title */}
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1, minHeight: 48 }}>
                      {job.title}
                    </Typography>

                    {/* Pay & Timing Details */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#f1f5f9',
                        mb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoneyIcon fontSize="small" color="success" />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                          ${job.pay_amount?.toFixed(2)} / {job.pay_unit?.replace('_', ' ')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(job.starts_at)} – {formatDateTime(job.ends_at)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GroupIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Spots: <strong>{job.remaining_capacity ?? job.capacity}</strong> left of {job.capacity}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Description preview */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {job.description}
                    </Typography>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button size="small" color="inherit" onClick={() => setSelectedJob(job)}>
                      View Details
                    </Button>

                    {user?.role === 'student' ? (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        disabled={isFull || bookingLoading}
                        onClick={() => handleBookJob(job.id)}
                        startIcon={<CheckCircleOutlineIcon />}
                      >
                        {isFull ? 'Fully Booked' : 'Book Shift'}
                      </Button>
                    ) : !isAuthenticated ? (
                      <Button variant="outlined" size="small" onClick={onOpenAuth}>
                        Sign In to Book
                      </Button>
                    ) : (
                      <Tooltip title="Only student accounts can book shifts">
                        <span>
                          <Button size="small" disabled variant="outlined">
                            Student Only
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <Dialog
          open={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              {selectedJob.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={selectedJob.category} size="small" color="primary" />
              <Chip label={selectedJob.location} size="small" variant="outlined" />
              <Chip
                label={`Status: ${selectedJob.status}`}
                size="small"
                color={selectedJob.status === 'published' ? 'success' : 'default'}
              />
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {selectedJob.description}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shift Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Compensation
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    ${selectedJob.pay_amount?.toFixed(2)} / {selectedJob.pay_unit?.replace('_', ' ')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Available Capacity
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {selectedJob.remaining_capacity ?? selectedJob.capacity} / {selectedJob.capacity} spots
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Schedule
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    From: {new Date(selectedJob.starts_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    To: {new Date(selectedJob.ends_at).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
            <Button onClick={() => setSelectedJob(null)} color="inherit">
              Close
            </Button>

            {user?.role === 'student' && (
              <Button
                variant="contained"
                color="primary"
                disabled={
                  (selectedJob.remaining_capacity !== undefined && selectedJob.remaining_capacity <= 0) ||
                  bookingLoading
                }
                onClick={() => handleBookJob(selectedJob.id)}
              >
                {bookingLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : selectedJob.remaining_capacity <= 0 ? (
                  'Fully Booked'
                ) : (
                  'Confirm & Book Shift'
                )}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
