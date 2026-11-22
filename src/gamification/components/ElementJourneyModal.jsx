import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Stack,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ScienceIcon from '@mui/icons-material/Science'
import HistoryIcon from '@mui/icons-material/History'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import ElementJourneyRoadmap from './ElementJourneyRoadmap'
import { api } from '../../services/api'
import {
  DEFAULT_ELEMENT_TIERS,
  normalizeGamificationSummary,
  normalizeElementTier,
  normalizePointTransaction,
} from '../types/gamification'

export default function ElementJourneyModal({ open, onClose, initialSummary }) {
  const [activeTab, setActiveTab] = useState(0) // 0: Roadmap, 1: Ledger, 2: Rules
  const [summary, setSummary] = useState(initialSummary ? normalizeGamificationSummary(initialSummary) : null)
  const [tiers, setTiers] = useState(DEFAULT_ELEMENT_TIERS)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [sumRes, tiersRes, txRes] = await Promise.allSettled([
          api.getGamificationSummary(),
          api.getGamificationTiers(),
          api.getGamificationTransactions(0, 50),
        ])

        if (sumRes.status === 'fulfilled' && sumRes.value) {
          setSummary(normalizeGamificationSummary(sumRes.value))
        }

        if (tiersRes.status === 'fulfilled' && Array.isArray(tiersRes.value) && tiersRes.value.length > 0) {
          setTiers(tiersRes.value.map(normalizeElementTier))
        }

        if (txRes.status === 'fulfilled' && txRes.value) {
          const list = Array.isArray(txRes.value) ? txRes.value : (txRes.value.content || [])
          setTransactions(list.map(normalizePointTransaction))
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          borderRadius: theme.shape?.borderRadius || 3,
          minHeight: 520,
        }),
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            NextShift Element Journey
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="Element Roadmap" />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Point History" />
          <Tab icon={<HelpOutlineIcon fontSize="small" />} iconPosition="start" label="Gamification Rules" />
        </Tabs>
      </Box>

      <DialogContent sx={{ py: 2.5 }}>
        {loading && !summary ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 0: Visual Roadmap */}
            {activeTab === 0 && (
              <ElementJourneyRoadmap summary={summary} tiers={tiers} />
            )}

            {/* Tab 1: Point Ledger */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Verified Point Transactions
                </Typography>
                {transactions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No point transactions recorded yet. Complete and log shifts to earn points!
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Shift / Reason</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Points Earned</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((tx, idx) => (
                          <TableRow key={tx.id || `tx-${idx}`}>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {tx.jobTitle || 'Campus Gig Shift'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tx.reason}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                size="small"
                                label={`+${tx.pointsDelta} pts`}
                                color="success"
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Tab 2: Gamification Rules & Guide */}
            {activeTab === 2 && (
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    How Element Journey Works
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    NextShift gamifies your campus gig experience using a curated progression of chemical elements and isotopes. As you complete verified work on campus, you earn points and level up through the periodic journey.
                  </Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    Core Rules:
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      • <strong>1 Verified Hour = 1 Point:</strong> Points are earned based on actual hours completed (`floor(minutes / 60)`). Partial hours carry forward to future sessions.
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Employer Confirmation:</strong> Points are only awarded after the employing department or manager confirms your work session.
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Isotope Threshold Formula:</strong> Each element tier threshold equals `Mass Number × 10` points (e.g. Carbon-14 requires 140 points).
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Starter Tier:</strong> Below 10 points (Hydrogen-1), students hold Starter (Unranked) status.
                    </Typography>
                    <Typography variant="body2">
                      • <strong>Lifetime Accumulation:</strong> Points never expire and reflect your cumulative verified work contribution.
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
