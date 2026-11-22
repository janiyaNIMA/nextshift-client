import { Box, Typography, LinearProgress, Stack, Chip, Grid } from '@mui/material'
import ElementCard from './ElementCard'
import { getTierStatus } from '../types/gamification'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

export default function ElementJourneyRoadmap({ summary, tiers = [] }) {
  const currentTier = summary?.currentTier
  const nextTier = summary?.nextTier
  const totalPoints = summary?.totalPoints ?? 0
  const progressPercent = summary?.progressPercent ?? 0
  const pointsToNext = summary?.pointsToNextTier ?? 0

  return (
    <Box>
      {/* Top Progress Overview Box */}
      <Box
        sx={(theme) => ({
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          bgcolor: theme.palette.mode === 'highContrast' ? '#0a0a0a' : 'background.paper',
          border: 1,
          borderColor: 'divider',
          mb: 3,
        })}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 1.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon color="primary" fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {currentTier ? `${currentTier.elementName} (${currentTier.tierCode})` : 'Starter (Unranked)'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              1 verified hour of work = 1 point. Points accumulate over your lifetime.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Chip
              label={`${totalPoints} Points`}
              color="primary"
              sx={{ fontWeight: 700 }}
            />
            {nextTier ? (
              <Chip
                label={`${pointsToNext} pts to ${nextTier.tierCode}`}
                variant="outlined"
                color="info"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip
                label="Maximum Tier Reached!"
                variant="outlined"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
        </Stack>

        {/* Linear Progress Bar to Next Tier */}
        <Box sx={{ width: '100%', mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {currentTier ? `${currentTier.requiredPoints} pts (${currentTier.tierCode})` : '0 pts (Starter)'}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {progressPercent.toFixed(1)}% Completed
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {nextTier ? `${nextTier.requiredPoints} pts (${nextTier.tierCode})` : 'Max Tier'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
              },
            }}
          />
        </Box>
      </Box>

      {/* Grid of All 19 Element Tiers */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Chemistry Element & Isotope Progression (19 Tiers)
      </Typography>

      <Grid container spacing={1.5}>
        {tiers.map((tier) => {
          const status = getTierStatus(tier, summary)
          const isTarget = nextTier?.tierCode === tier.tierCode
          return (
            <Grid item xs={6} sm={4} md={2.4} key={tier.tierCode}>
              <ElementCard tier={tier} status={status} isTarget={isTarget} />
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
