import { useState, useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Container,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import BusinessIcon from '@mui/icons-material/Business'
import SchoolIcon from '@mui/icons-material/School'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import ContrastIcon from '@mui/icons-material/Contrast'
import ScienceIcon from '@mui/icons-material/Science'
import { useAuth } from '../context/useAuth'
import { useThemeMode } from '../context/useTheme'
import { useNotification } from '../context/useNotification'
import { api } from '../services/api'
import { normalizeGamificationSummary } from '../gamification/types/gamification'
import ElementJourneyModal from '../gamification/components/ElementJourneyModal'

export default function Navbar({ currentTab, onTabChange, onOpenAuth, onOpenSettings }) {
  const { user, isAuthenticated, logout, healthStatus, checkHealth, apiUrl } = useAuth()
  const { mode, cycleMode } = useThemeMode()
  const { showInfo } = useNotification()
  const [anchorEl, setAnchorEl] = useState(null)
  const [gamification, setGamification] = useState(null)
  const [journeyModalOpen, setJourneyModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    if (isAuthenticated && user?.role?.toLowerCase() === 'student') {
      api.getGamificationSummary()
        .then((data) => {
          if (isMounted && data) {
            setGamification(normalizeGamificationSummary(data))
          }
        })
        .catch((err) => {
          console.debug('Gamification summary fetch error in Navbar:', err)
        })
    } else {
      setGamification(null)
    }
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user])

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleCloseUserMenu()
    logout()
    showInfo('You have been signed out.')
  }

  const getRoleIcon = (role) => {
    const r = role?.toLowerCase()
    if (r === 'admin') return <SupervisorAccountIcon fontSize="small" />
    if (r === 'employer') return <BusinessIcon fontSize="small" />
    return <SchoolIcon fontSize="small" />
  }

  const getRoleColor = (role) => {
    const r = role?.toLowerCase()
    if (r === 'admin') return 'secondary'
    if (r === 'employer') return 'warning'
    return 'info'
  }

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          {/* Logo & Brand */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }}
            onClick={() => onTabChange('jobs')}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>
              <WorkIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1, color: 'primary.main' }}>
                NextShift
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Campus Job Marketplace
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              variant={currentTab === 'jobs' ? 'contained' : 'text'}
              color="primary"
              onClick={() => onTabChange('jobs')}
              sx={{ borderRadius: 2 }}
            >
              Browse Shifts
            </Button>

            {isAuthenticated && user?.role?.toLowerCase() === 'student' && (
              <Button
                variant={currentTab === 'my-bookings' ? 'contained' : 'text'}
                color="primary"
                onClick={() => onTabChange('my-bookings')}
                sx={{ borderRadius: 2 }}
              >
                My Bookings
              </Button>
            )}

            {isAuthenticated && user?.role?.toLowerCase() === 'employer' && (
              <Button
                variant={currentTab === 'employer' ? 'contained' : 'text'}
                color="primary"
                onClick={() => onTabChange('employer')}
                sx={{ borderRadius: 2 }}
              >
                Employer Portal
              </Button>
            )}

            {isAuthenticated && user?.role?.toLowerCase() === 'admin' && (
              <Button
                variant={currentTab === 'admin' ? 'contained' : 'text'}
                color="primary"
                onClick={() => onTabChange('admin')}
                sx={{ borderRadius: 2 }}
              >
                Admin Review
              </Button>
            )}
          </Box>

          {/* Right Section: Status, Settings, Profile / Login */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Server Health Status Pill */}
            <Tooltip title={`Backend: ${healthStatus.isOnline ? `Online (${apiUrl})` : healthStatus.error || 'Offline'} - Click to re-check`}>
              <Chip
                size="small"
                icon={
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: '12px !important',
                      color: (theme) => (healthStatus.isOnline ? `${theme.palette.success.main} !important` : `${theme.palette.error.main} !important`),
                    }}
                  />
                }
                label={healthStatus.isOnline ? 'API Online' : 'API Offline'}
                onClick={checkHealth}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  borderColor: (theme) => (healthStatus.isOnline ? theme.palette.success.light : theme.palette.error.light),
                  bgcolor: (theme) => (healthStatus.isOnline
                    ? (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5')
                    : (theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2')),
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            </Tooltip>

            {/* Element Journey Badge for Students */}
            {isAuthenticated && user?.role?.toLowerCase() === 'student' && (
              <Tooltip title="Element Journey: View your chemical isotope tier & points">
                <Chip
                  icon={<ScienceIcon fontSize="small" />}
                  label={gamification?.currentTier ? `${gamification.currentTier.tierCode} • ${gamification.totalPoints} pts` : `Starter • ${gamification?.totalPoints || 0} pts`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  clickable
                  onClick={() => setJourneyModalOpen(true)}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)'),
                  }}
                />
              </Tooltip>
            )}

            {/* Theme Toggle Button */}
            <Tooltip title={`Theme: ${mode === 'highContrast' ? 'High Contrast' : mode === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to cycle)`}>
              <IconButton size="small" onClick={cycleMode} sx={{ color: 'text.secondary' }}>
                {mode === 'highContrast' ? (
                  <ContrastIcon fontSize="small" />
                ) : mode === 'dark' ? (
                  <DarkModeIcon fontSize="small" />
                ) : (
                  <LightModeIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Settings button */}
            <Tooltip title="API Settings">
              <IconButton size="small" onClick={onOpenSettings} sx={{ color: 'text.secondary' }}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <>
                <Box
                  onClick={handleOpenUserMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    p: 0.5,
                    borderRadius: 3,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.dark', fontSize: '0.9rem' }}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {user?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        size="small"
                        icon={getRoleIcon(user?.role)}
                        label={user?.role}
                        color={getRoleColor(user?.role)}
                        sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
                      />
                      {user?.role?.toLowerCase() === 'employer' && !user?.is_approved && (
                        <Chip
                          size="small"
                          label="Pending Approval"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: { width: 230, mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      const r = user?.role?.toLowerCase()
                      if (r === 'student') onTabChange('my-bookings')
                      else if (r === 'employer') onTabChange('employer')
                      else if (r === 'admin') onTabChange('admin')
                    }}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  {user?.role?.toLowerCase() === 'student' && (
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu()
                        setJourneyModalOpen(true)
                      }}
                    >
                      <ListItemIcon>
                        <ScienceIcon fontSize="small" />
                      </ListItemIcon>
                      Element Journey
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={onOpenAuth}
                startIcon={<AccountCircleIcon />}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>

        {/* Mobile Nav Tabs */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, pb: 1, gap: 1, overflowX: 'auto' }}>
          <Button
            size="small"
            variant={currentTab === 'jobs' ? 'contained' : 'outlined'}
            onClick={() => onTabChange('jobs')}
          >
            Shifts
          </Button>
          {isAuthenticated && user?.role?.toLowerCase() === 'student' && (
            <Button
              size="small"
              variant={currentTab === 'my-bookings' ? 'contained' : 'outlined'}
              onClick={() => onTabChange('my-bookings')}
            >
              My Bookings
            </Button>
          )}
          {isAuthenticated && user?.role?.toLowerCase() === 'employer' && (
            <Button
              size="small"
              variant={currentTab === 'employer' ? 'contained' : 'outlined'}
              onClick={() => onTabChange('employer')}
            >
              Employer Hub
            </Button>
          )}
          {isAuthenticated && user?.role?.toLowerCase() === 'admin' && (
            <Button
              size="small"
              variant={currentTab === 'admin' ? 'contained' : 'outlined'}
              onClick={() => onTabChange('admin')}
            >
              Admin
            </Button>
          )}
        </Box>
      </Container>

      {/* Element Journey Modal */}
      {isAuthenticated && user?.role?.toLowerCase() === 'student' && (
        <ElementJourneyModal
          open={journeyModalOpen}
          onClose={() => setJourneyModalOpen(false)}
          initialSummary={gamification}
        />
      )}
    </AppBar>
  )
}
