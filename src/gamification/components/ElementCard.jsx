import { Card, CardContent, Typography, Box, Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import StarIcon from '@mui/icons-material/Star'

export default function ElementCard({ tier, status = 'upcoming', isTarget = false, onClick }) {
  if (!tier) return null

  const isCurrent = status === 'current'
  const isReached = status === 'reached'

  return (
    <Card
      onClick={onClick}
      sx={(theme) => {
        const isHc = theme.palette.mode === 'highContrast'
        const isDark = theme.palette.mode === 'dark'

        let borderColor = theme.palette.divider
        let bgcolor = 'background.paper'

        if (isCurrent) {
          borderColor = isHc ? '#facc15' : theme.palette.primary.main
          bgcolor = isHc ? '#0a0a0a' : isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.05)'
        } else if (isReached) {
          borderColor = isHc ? '#4ade80' : theme.palette.success.light
          bgcolor = isHc ? '#0a0a0a' : isDark ? 'rgba(52, 211, 153, 0.08)' : 'rgba(16, 185, 129, 0.04)'
        } else if (isTarget) {
          borderColor = theme.palette.info.main
        }

        return {
          minWidth: 140,
          maxWidth: 175,
          position: 'relative',
          borderRadius: isHc ? 1 : 2.5,
          border: isCurrent || isHc ? 2 : 1,
          borderColor,
          bgcolor,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': onClick
            ? {
                transform: 'translateY(-3px)',
                boxShadow: isHc ? 'none' : '0 6px 20px rgba(0,0,0,0.12)',
              }
            : {},
        }
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Top Header: Mass number & Status Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontFamily: 'monospace' }}>
            {tier.massNumber}
          </Typography>

          {isCurrent && (
            <Chip
              size="small"
              icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
              label="Current"
              color="primary"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
            />
          )}
          {isReached && !isCurrent && (
            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
          )}
          {!isReached && !isCurrent && (
            <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          )}
        </Box>

        {/* Center: Large Chemical Symbol */}
        <Box sx={{ textAlign: 'center', py: 0.5 }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: isCurrent ? 'primary.main' : isReached ? 'text.primary' : 'text.secondary',
            }}
          >
            {tier.symbol}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              fontWeight: 600,
              color: 'text.secondary',
              mt: 0.3,
            }}
          >
            {tier.elementName}
          </Typography>
        </Box>

        {/* Bottom: Required Points & Code */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
            pt: 0.8,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {tier.tierCode}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: isReached ? 'success.main' : isCurrent ? 'primary.main' : 'text.disabled',
            }}
          >
            {tier.requiredPoints} pts
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
