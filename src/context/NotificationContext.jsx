import { useState, useCallback, useMemo } from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import { NotificationContext } from './notificationContextBase'

function SlideTransition(props) {
  return <Slide {...props} direction="left" />
}

export function NotificationProvider({ children }) {
  // Snackbar Toast State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'error' | 'warning' | 'info' | 'success'
    title: '',
    duration: 6000,
  })

  // Modal Error Popup Dialog State
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: '',
    message: '',
    details: '',
    actionLabel: '',
    onAction: null,
  })

  // Dismiss snackbar
  const closeNotification = useCallback((_, reason) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }, [])

  // Show standard notification toast
  const showNotification = useCallback((message, severity = 'info', options = {}) => {
    setSnackbar({
      open: true,
      message: String(message || 'An event occurred'),
      severity,
      title: options.title || '',
      duration: options.duration !== undefined ? options.duration : 6000,
    })
  }, [])

  // Quick severity helpers
  const showError = useCallback((message, options = {}) => {
    showNotification(message, 'error', {
      title: options.title || 'Error',
      duration: options.duration || 7000,
      ...options,
    })
  }, [showNotification])

  const showSuccess = useCallback((message, options = {}) => {
    showNotification(message, 'success', {
      title: options.title || 'Success',
      duration: options.duration || 4500,
      ...options,
    })
  }, [showNotification])

  const showWarning = useCallback((message, options = {}) => {
    showNotification(message, 'warning', {
      title: options.title || 'Warning',
      duration: options.duration || 5500,
      ...options,
    })
  }, [showNotification])

  const showInfo = useCallback((message, options = {}) => {
    showNotification(message, 'info', {
      title: options.title || '',
      duration: options.duration || 5000,
      ...options,
    })
  }, [showNotification])

  // Show prominent modal Error Dialog popup
  const showErrorDialog = useCallback(({ title = 'Application Error', message, details = '', actionLabel = 'OK', onAction = null }) => {
    setErrorDialog({
      open: true,
      title,
      message: String(message || 'An unexpected error occurred.'),
      details: typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details || ''),
      actionLabel,
      onAction,
    })
  }, [])

  const closeErrorDialog = useCallback(() => {
    setErrorDialog((prev) => ({ ...prev, open: false }))
  }, [])

  const contextValue = useMemo(() => ({
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showErrorDialog,
    closeNotification,
    closeErrorDialog,
  }), [
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showErrorDialog,
    closeNotification,
    closeErrorDialog,
  ])

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Floating MUI Snackbar Alert Popup */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
        sx={{
          mt: 2,
          mr: 1,
          maxWidth: { xs: '92vw', sm: 460 },
          zIndex: (theme) => theme.zIndex.snackbar + 100,
        }}
      >
        <Alert
          onClose={closeNotification}
          severity={snackbar.severity}
          variant="filled"
          sx={(theme) => ({
            width: '100%',
            borderRadius: theme.shape?.borderRadius || 2,
            boxShadow: theme.palette.mode === 'highContrast'
              ? 'none'
              : '0 8px 32px rgba(0, 0, 0, 0.24)',
            border: theme.palette.mode === 'highContrast'
              ? '2px solid #ffffff'
              : undefined,
            '& .MuiAlert-icon': {
              fontSize: '1.4rem',
              alignSelf: snackbar.title ? 'flex-start' : 'center',
              mt: snackbar.title ? 0.3 : 0,
            },
          })}
        >
          {snackbar.title && (
            <AlertTitle sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
              {snackbar.title}
            </AlertTitle>
          )}
          <Typography variant="body2" sx={{ lineHeight: 1.4, wordBreak: 'break-word' }}>
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Prominent MUI Error Modal Dialog Popup */}
      <Dialog
        open={errorDialog.open}
        onClose={closeErrorDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: (theme) => ({
            borderRadius: theme.shape?.borderRadius || 3,
            p: 1,
            border: theme.palette.mode === 'highContrast' ? '2px solid #ffffff' : undefined,
          }),
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: (theme) => `${theme.palette.error.main}1A`,
              color: 'error.main',
            }}
          >
            <ErrorOutlinedIcon fontSize="medium" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {errorDialog.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={closeErrorDialog} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2.5 }}>
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
              {errorDialog.message}
            </Typography>

            {errorDialog.details && (
              <Box
                component="pre"
                sx={(theme) => ({
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.background.subtle || 'action.hover',
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                })}
              >
                {errorDialog.details}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (errorDialog.onAction) {
                errorDialog.onAction()
              }
              closeErrorDialog()
            }}
          >
            {errorDialog.actionLabel || 'OK'}
          </Button>
        </DialogActions>
      </Dialog>
    </NotificationContext.Provider>
  )
}
