import { useState, useCallback } from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogActions,
  Button,
  Slide,
  Box,
  Typography,
} from '@mui/material'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { NotificationContext } from './notificationContextBase'

function SlideTransition(props) {
  return <Slide {...props} direction="down" />
}

export function NotificationProvider({ children }) {
  // Toast / Snackbar popup state
  const [toast, setToast] = useState({
    open: false,
    message: '',
    title: '',
    severity: 'info', // 'error' | 'success' | 'warning' | 'info'
    autoHideDuration: 5000,
  })

  // Modal Dialog popup state (for critical or explicit dialog popups)
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    message: '',
    details: '',
  })

  const showNotification = useCallback((message, severity = 'info', title = '') => {
    setToast({
      open: true,
      message: typeof message === 'string' ? message : String(message || 'An event occurred'),
      title,
      severity,
      autoHideDuration: severity === 'error' ? 6000 : 4000,
    })
  }, [])

  const showError = useCallback((message, title = 'Error') => {
    showNotification(message, 'error', title)
  }, [showNotification])

  const showSuccess = useCallback((message, title = '') => {
    showNotification(message, 'success', title)
  }, [showNotification])

  const showWarning = useCallback((message, title = '') => {
    showNotification(message, 'warning', title)
  }, [showNotification])

  const showInfo = useCallback((message, title = '') => {
    showNotification(message, 'info', title)
  }, [showNotification])

  const showErrorDialog = useCallback(({ title = 'Error Occurred', message, details = '' }) => {
    setDialog({
      open: true,
      title,
      message: typeof message === 'string' ? message : String(message || 'An unexpected error occurred'),
      details,
    })
  }, [])

  const handleCloseToast = useCallback((_, reason) => {
    if (reason === 'clickaway') return
    setToast((prev) => ({ ...prev, open: false }))
  }, [])

  const handleCloseDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }))
  }, [])

  const value = {
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showErrorDialog,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Floating MUI Snackbar Popup Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.autoHideDuration}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        slots={{ transition: SlideTransition }}
        sx={{
          top: { xs: 16, sm: 24 },
          zIndex: (theme) => theme.zIndex.snackbar + 100,
        }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          elevation={6}
          sx={{
            minWidth: { xs: '90vw', sm: 380 },
            maxWidth: 600,
            borderRadius: 2.5,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            fontSize: '0.95rem',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.6rem',
              alignSelf: 'center',
            },
          }}
        >
          {toast.title && <AlertTitle sx={{ fontWeight: 700, mb: 0.3 }}>{toast.title}</AlertTitle>}
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Modal MUI Error Dialog Popup */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 48, mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {dialog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: dialog.details ? 1.5 : 0 }}>
            {dialog.message}
          </Typography>
          {dialog.details && (
            <Box
              component="pre"
              sx={{
                bgcolor: '#f1f5f9',
                p: 1.5,
                borderRadius: 1.5,
                fontSize: '0.75rem',
                color: '#475569',
                maxWidth: '100%',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {dialog.details}
            </Box>
          )}
        </Box>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: 2, py: 1 }}
          >
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </NotificationContext.Provider>
  )
}
