import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Divider,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'
import BusinessIcon from '@mui/icons-material/Business'
import WorkIcon from '@mui/icons-material/Work'
import { api } from '../services/api'

export default function AdminDashboard({ showNotification }) {
  const [activeTab, setActiveTab] = useState(0) // 0: Employers, 1: Jobs
  const [pendingEmployers, setPendingEmployers] = useState([])
  const [pendingJobs, setPendingJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [employersData, jobsData] = await Promise.all([
        api.getPendingEmployers(),
        api.getPendingJobs(),
      ])
      setPendingEmployers(Array.isArray(employersData) ? employersData : [])
      setPendingJobs(Array.isArray(jobsData) ? jobsData : [])
    } catch (err) {
      setError(err.message || 'Failed to load pending admin items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApproveEmployer = async (userId, name) => {
    setActionLoadingId(`emp-${userId}`)
    try {
      await api.approveEmployer(userId)
      showNotification(`Employer "${name}" has been approved!`, 'success')
      fetchData()
    } catch (err) {
      showNotification(err.message || 'Approval failed', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleApproveJob = async (jobId, title) => {
    setActionLoadingId(`job-${jobId}`)
    try {
      await api.approveJob(jobId)
      showNotification(`Job vacancy "${title}" has been approved and published!`, 'success')
      fetchData()
    } catch (err) {
      showNotification(err.message || 'Job approval failed', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Administrator Review Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve pending employer registrations and job shift postings
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh All
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={0}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            icon={<BusinessIcon />}
            iconPosition="start"
            label={`Pending Employers (${pendingEmployers.length})`}
          />
          <Tab
            icon={<WorkIcon />}
            iconPosition="start"
            label={`Pending Shift Postings (${pendingJobs.length})`}
          />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : activeTab === 0 ? (
        // ================= TAB 0: PENDING EMPLOYERS =================
        pendingEmployers.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No pending employer approvals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All registered employer accounts are currently reviewed and approved.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employer ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Registered On</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingEmployers.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>#{emp.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{formatDateTime(emp.created_at)}</TableCell>
                    <TableCell>
                      <Chip label="Pending Approval" color="warning" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        disabled={actionLoadingId === `emp-${emp.id}`}
                        onClick={() => handleApproveEmployer(emp.id, emp.name)}
                      >
                        {actionLoadingId === `emp-${emp.id}` ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          'Approve Employer'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        // ================= TAB 1: PENDING JOBS =================
        pendingJobs.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }} elevation={0}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No pending shifts to review
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All submitted shift vacancies have been processed.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {pendingJobs.map((job) => (
              <Grid item xs={12} md={6} key={job.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Job #{job.id} • Employer #{job.employer_id}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {job.title}
                        </Typography>
                      </Box>
                      <Chip label="Pending Review" color="warning" size="small" />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={job.category} size="small" variant="outlined" color="primary" />
                      <Chip label={job.location} size="small" variant="outlined" />
                    </Stack>

                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                        Rate: ${job.pay_amount?.toFixed(2)} / {job.pay_unit?.replace('_', ' ')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Schedule: {formatDateTime(job.starts_at)} – {formatDateTime(job.ends_at)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Capacity: {job.capacity} students required
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {job.description}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        disabled={actionLoadingId === `job-${job.id}`}
                        onClick={() => handleApproveJob(job.id, job.title)}
                      >
                        {actionLoadingId === `job-${job.id}` ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          'Approve & Publish Shift'
                        )}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}
    </Box>
  )
}
