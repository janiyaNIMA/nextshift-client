import { useState } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Snackbar,
  Alert,
  Typography,
  Link as MuiLink,
} from '@mui/material'
import { theme } from './theme'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Navbar from './components/Navbar'
import JobsList from './components/JobsList'
import StudentBookings from './components/StudentBookings'
import EmployerDashboard from './components/EmployerDashboard'
import AdminDashboard from './components/AdminDashboard'
import SettingsModal from './components/SettingsModal'
import AuthLoginPage from './components/AuthLoginPage'

function MainContent() {
  const { user, isAuthenticated } = useAuth()
  const [currentTab, setCurrentTab] = useState('jobs')
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  // Centralized notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
  })

  const showNotification = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  // Adjust tab automatically if unauthorized
  const handleTabChange = (newTab) => {
    if (newTab === 'my-bookings' && (!isAuthenticated || user?.role !== 'student')) {
      showNotification('Please sign in as a student to view your bookings', 'warning')
      return
    }
    if (newTab === 'employer' && (!isAuthenticated || user?.role !== 'employer')) {
      showNotification('Please sign in as an employer to access employer hub', 'warning')
      return
    }
    if (newTab === 'admin' && (!isAuthenticated || user?.role !== 'admin')) {
      showNotification('Please sign in with administrator credentials', 'warning')
      return
    }
    setCurrentTab(newTab)
  }

  if (!isAuthenticated) {
    return <AuthLoginPage />
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenAuth={() => {}}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      <Container maxWidth="xl" component="main" sx={{ flexGrow: 1, py: 2 }}>
        {currentTab === 'jobs' && (
          <JobsList
            onOpenAuth={() => setAuthModalOpen(true)}
            showNotification={showNotification}
          />
        )}

        {currentTab === 'my-bookings' && (
          <StudentBookings
            onBrowseJobs={() => setCurrentTab('jobs')}
            showNotification={showNotification}
          />
        )}

        {currentTab === 'employer' && (
          <EmployerDashboard showNotification={showNotification} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard showNotification={showNotification} />
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          borderTop: '1px solid #e2e8f0',
          bgcolor: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          NextShift Campus Job Marketplace • Built with Material-UI & React 19
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Backend API Contract: <MuiLink href="/ref/FRONTEND_API_HANDOFF.md" target="_blank">ref/FRONTEND_API_HANDOFF.md</MuiLink>
        </Typography>
      </Box>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
