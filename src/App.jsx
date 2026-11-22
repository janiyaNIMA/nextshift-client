import { useState, useEffect } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Typography,
  Link as MuiLink,
} from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { ThemeContextProvider } from './context/ThemeContext'
import { useThemeMode } from './context/useTheme'
import { NotificationProvider } from './context/NotificationContext'
import { useNotification } from './context/useNotification'
import Navbar from './components/Navbar'
import JobsList from './components/JobsList'
import StudentBookings from './components/StudentBookings'
import EmployerDashboard from './components/EmployerDashboard'
import AdminDashboard from './components/AdminDashboard'
import SettingsModal from './components/SettingsModal'
import AuthLoginPage from './components/AuthLoginPage'
import AuthModal from './components/AuthModal'

function MainContent() {
  const { user, isAuthenticated } = useAuth()
  const [currentTab, setCurrentTab] = useState('jobs')
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { showNotification } = useNotification()

  // Automatically redirect user to their role-specific dashboard upon login or role change
  useEffect(() => {
    if (user?.role) {
      const role = user.role.toLowerCase()
      if (role === 'admin') {
        setCurrentTab('admin')
      } else if (role === 'employer') {
        setCurrentTab('employer')
      } else if (role === 'student') {
        setCurrentTab('jobs')
      }
    }
  }, [user?.role, user?.id])

  // Adjust tab automatically if unauthorized
  const handleTabChange = (newTab) => {
    const role = user?.role?.toLowerCase()
    if (newTab === 'my-bookings' && (!isAuthenticated || role !== 'student')) {
      showNotification('Please sign in as a student to view your bookings', 'warning')
      return
    }
    if (newTab === 'employer' && (!isAuthenticated || role !== 'employer')) {
      showNotification('Please sign in as an employer to access employer hub', 'warning')
      return
    }
    if (newTab === 'admin' && (!isAuthenticated || role !== 'admin')) {
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
        onOpenAuth={() => setAuthModalOpen(true)}
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
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
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

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccessNotification={showNotification}
      />
    </Box>
  )
}

function ThemedApp() {
  const { theme } = useThemeMode()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <MainContent />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <ThemedApp />
      </ThemeContextProvider>
    </AuthProvider>
  )
}
