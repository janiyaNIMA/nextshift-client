import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { api } from '../services/api'
import { useAuth } from '../context/useAuth'

const toInputDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const getDefaultShiftDates = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(13, 0, 0, 0)
  return {
    starts_at: toInputDate(tomorrow),
    ends_at: toInputDate(tomorrowEnd),
  }
}

export default function EmployerDashboard({ showNotification }) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Create Job Dialog state
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState(() => {
    const dates = getDefaultShiftDates()
    return {
      title: '',
      description: '',
      category: 'Technology',
      location: '',
      pay_amount: 18.0,
      pay_unit: 'per_hour',
      starts_at: dates.starts_at,
      ends_at: dates.ends_at,
      capacity: 2,
    }
  })

  // Bookings / Applicants Dialog state
  const [selectedJobForBookings, setSelectedJobForBookings] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState(null)

  const fetchEmployerJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getEmployerJobs({ limit: 50 })
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch your jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployerJobs()
  }, [fetchEmployerJobs])

  const handleOpenCreate = () => {
    if (!user?.is_approved) {
      showNotification('Your employer account is pending approval by an admin.', 'warning')
      return
    }
    const dates = getDefaultShiftDates()
    setFormData({
      title: '',
      description: '',
      category: 'Technology',
      location: '',
      pay_amount: 18.0,
      pay_unit: 'per_hour',
      starts_at: dates.starts_at,
      ends_at: dates.ends_at,
      capacity: 2,
    })
    setFormError('')
    setOpenCreateDialog(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const startDate = new Date(formData.starts_at)
    const endDate = new Date(formData.ends_at)

    if (endDate <= startDate) {
      setFormError('End time must be strictly after start time.')
      return
    }

    if (formData.capacity < 1) {
      setFormError('Capacity must be at least 1.')
      return
    }

    if (formData.pay_amount < 0) {
      setFormError('Pay amount must be nonnegative.')
      return
    }

    setCreateLoading(true)
    try {
      await api.createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        location: formData.location.trim(),
        pay_amount: parseFloat(formData.pay_amount),
        pay_unit: formData.pay_unit,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        capacity: parseInt(formData.capacity, 10),
      })
      showNotification('Job vacancy created! It will be reviewed by an admin.', 'success')
      setOpenCreateDialog(false)
      fetchEmployerJobs()
    } catch (err) {
      setFormError(err.message || 'Failed to create job')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleViewBookings = async (job) => {
    setSelectedJobForBookings(job)
    setLoadingBookings(true)
    setBookingsError(null)
    try {
      const data = await api.getJobBookings(job.id)
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setBookingsError(err.message || 'Failed to fetch applicants')
    } finally {
      setLoadingBookings(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    try {
      return new Date(isoString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Pending approval banner if unapproved */}
      {!user?.is_approved && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Account Pending Approval
          </Typography>
          Your employer account has not been approved by an administrator yet. Once approved, you will be able to create and publish shifts.
        </Alert>
      )}

      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Employer Management Hub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your posted campus shift vacancies and review student applicants
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchEmployerJobs}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!user?.is_approved}
          >
            Post New Shift
          </Button>
        </Stack>
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
      ) : jobs.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No shift vacancies posted yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {user?.is_approved
              ? 'Click "Post New Shift" to create your first campus vacancy.'
              : 'Once your employer account is approved by an admin, you can post vacancies here.'}
          </Typography>
          {user?.is_approved && (
            <Button variant="contained" color="primary" onClick={handleOpenCreate} startIcon={<AddIcon />}>
              Create Shift Vacancy
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Job ID #{job.id}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {job.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                    <Chip label={job.category} size="small" variant="outlined" color="primary" />
                    <Chip
                      icon={<LocationOnIcon fontSize="small" />}
                      label={job.location}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="success" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                        ${job.pay_amount?.toFixed(2)} / {job.pay_unit?.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(job.starts_at)} – {formatDateTime(job.ends_at)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Capacity: <strong>{job.remaining_capacity ?? job.capacity}</strong> remaining out of {job.capacity} total
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </Typography>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PeopleAltIcon />}
                    onClick={() => handleViewBookings(job)}
                  >
                    View Applicants
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ================= CREATE JOB MODAL ================= */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Post a New Campus Shift</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
              {formError}
            </Alert>
          )}

          <Box component="form" id="create-job-form" onSubmit={handleCreateSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Shift Title"
                  required
                  fullWidth
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. IT Lab Assistant, Library Cataloguer, Event Usher"
                  inputProps={{ minLength: 3, maxLength: 255 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category"
                  required
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Technology, Catering, Administrative"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Campus Location"
                  required
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Computer Science Lab 2B, Main Library"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pay Amount ($)"
                  type="number"
                  required
                  fullWidth
                  value={formData.pay_amount}
                  onChange={(e) => setFormData({ ...formData, pay_amount: e.target.value })}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Pay Unit"
                  required
                  fullWidth
                  value={formData.pay_unit}
                  onChange={(e) => setFormData({ ...formData, pay_unit: e.target.value })}
                >
                  <MenuItem value="per_hour">per_hour</MenuItem>
                  <MenuItem value="fixed">fixed</MenuItem>
                  <MenuItem value="per_day">per_day</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Starts At"
                  type="datetime-local"
                  required
                  fullWidth
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ends At"
                  type="datetime-local"
                  required
                  fullWidth
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Student Capacity"
                  type="number"
                  required
                  fullWidth
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  inputProps={{ min: 1 }}
                  helperText="Number of students required for this shift"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Job Description & Responsibilities"
                  required
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about duties, requirements, dress code, etc. (min 10 characters)"
                  inputProps={{ minLength: 10 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)} color="inherit" disabled={createLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-job-form"
            variant="contained"
            color="primary"
            disabled={createLoading}
          >
            {createLoading ? <CircularProgress size={24} color="inherit" /> : 'Publish Shift Vacancy'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= APPLICANTS / BOOKINGS MODAL ================= */}
      {selectedJobForBookings && (
        <Dialog
          open={Boolean(selectedJobForBookings)}
          onClose={() => setSelectedJobForBookings(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Applicants for: {selectedJobForBookings.title}
          </DialogTitle>
          <DialogContent dividers>
            {bookingsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingsError}
              </Alert>
            )}

            {loadingBookings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : bookings.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc' }} elevation={0}>
                <Typography variant="body1" color="text.secondary">
                  No students have booked this shift yet.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Booking ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Booked At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>#{b.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{b.student?.name || `Student #${b.student_id}`}</TableCell>
                        <TableCell>{b.student?.email || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={b.status}
                            color={b.status === 'confirmed' ? 'success' : 'default'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{formatDateTime(b.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setSelectedJobForBookings(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}
