/**
 * NextShift Element Journey — Gamification Types and Constants
 *
 * Rules:
 * - 1 verified completed working hour = 1 point
 * - Points awarded only after employer confirmation
 * - Threshold = massNumber * 10
 * - Below 10 points: Starter / Unranked
 */

// Initial curated gamification isotope progression reference
export const DEFAULT_ELEMENT_TIERS = [
  { tierCode: 'H-1', elementName: 'Hydrogen', symbol: 'H', massNumber: 1, requiredPoints: 10, category: 'Nonmetal' },
  { tierCode: 'He-4', elementName: 'Helium', symbol: 'He', massNumber: 4, requiredPoints: 40, category: 'Noble Gas' },
  { tierCode: 'Li-7', elementName: 'Lithium', symbol: 'Li', massNumber: 7, requiredPoints: 70, category: 'Alkali Metal' },
  { tierCode: 'Be-9', elementName: 'Beryllium', symbol: 'Be', massNumber: 9, requiredPoints: 90, category: 'Alkaline Earth' },
  { tierCode: 'B-11', elementName: 'Boron', symbol: 'B', massNumber: 11, requiredPoints: 110, category: 'Metalloid' },
  { tierCode: 'C-12', elementName: 'Carbon', symbol: 'C', massNumber: 12, requiredPoints: 120, category: 'Nonmetal' },
  { tierCode: 'C-14', elementName: 'Carbon', symbol: 'C', massNumber: 14, requiredPoints: 140, category: 'Radioactive Isotope' },
  { tierCode: 'N-15', elementName: 'Nitrogen', symbol: 'N', massNumber: 15, requiredPoints: 150, category: 'Nonmetal' },
  { tierCode: 'O-16', elementName: 'Oxygen', symbol: 'O', massNumber: 16, requiredPoints: 160, category: 'Nonmetal' },
  { tierCode: 'F-19', elementName: 'Fluorine', symbol: 'F', massNumber: 19, requiredPoints: 190, category: 'Halogen' },
  { tierCode: 'Ne-20', elementName: 'Neon', symbol: 'Ne', massNumber: 20, requiredPoints: 200, category: 'Noble Gas' },
  { tierCode: 'Na-23', elementName: 'Sodium', symbol: 'Na', massNumber: 23, requiredPoints: 230, category: 'Alkali Metal' },
  { tierCode: 'Mg-24', elementName: 'Magnesium', symbol: 'Mg', massNumber: 24, requiredPoints: 240, category: 'Alkaline Earth' },
  { tierCode: 'Al-27', elementName: 'Aluminium', symbol: 'Al', massNumber: 27, requiredPoints: 270, category: 'Post-transition Metal' },
  { tierCode: 'Si-28', elementName: 'Silicon', symbol: 'Si', massNumber: 28, requiredPoints: 280, category: 'Metalloid' },
  { tierCode: 'P-31', elementName: 'Phosphorus', symbol: 'P', massNumber: 31, requiredPoints: 310, category: 'Nonmetal' },
  { tierCode: 'S-32', elementName: 'Sulfur', symbol: 'S', massNumber: 32, requiredPoints: 320, category: 'Nonmetal' },
  { tierCode: 'Cl-35', elementName: 'Chlorine', symbol: 'Cl', massNumber: 35, requiredPoints: 350, category: 'Halogen' },
  { tierCode: 'Ar-40', elementName: 'Argon', symbol: 'Ar', massNumber: 40, requiredPoints: 400, category: 'Noble Gas' },
]

/**
 * Normalizes an ElementTier object from backend API
 */
export const normalizeElementTier = (tier) => {
  if (!tier) return null
  const massNumber = Number(tier.massNumber ?? tier.mass_number ?? 0)
  const requiredPoints = Number(tier.requiredPoints ?? tier.required_points ?? (massNumber * 10))
  const tierCode = tier.tierCode || tier.tier_code || (tier.symbol ? `${tier.symbol}-${massNumber}` : 'UNRANKED')
  const elementName = tier.elementName || tier.element_name || 'Element'
  const symbol = tier.symbol || (tierCode.includes('-') ? tierCode.split('-')[0] : 'E')

  return {
    tierCode,
    elementName,
    symbol,
    massNumber,
    requiredPoints,
    category: tier.category || 'Element',
    description: tier.description || `${elementName}-${massNumber}`,
  }
}

/**
 * Normalizes GamificationSummary from backend API response
 */
export const normalizeGamificationSummary = (data) => {
  if (!data) {
    return {
      totalPoints: 0,
      currentTier: null,
      nextTier: normalizeElementTier(DEFAULT_ELEMENT_TIERS[0]),
      pointsToNextTier: 10,
      progressPercent: 0,
      isStarter: true,
      isMaxTier: false,
    }
  }

  const totalPoints = Math.max(0, Number(data.totalPoints ?? data.total_points ?? 0))
  const currentTier = data.currentTier ? normalizeElementTier(data.currentTier) : null
  const nextTier = data.nextTier ? normalizeElementTier(data.nextTier) : null

  // Treat backend values as authoritative
  let pointsToNextTier = 0
  if (data.pointsToNextTier !== undefined && data.pointsToNextTier !== null) {
    pointsToNextTier = Math.max(0, Number(data.pointsToNextTier))
  } else if (data.points_to_next_tier !== undefined && data.points_to_next_tier !== null) {
    pointsToNextTier = Math.max(0, Number(data.points_to_next_tier))
  } else if (nextTier) {
    pointsToNextTier = Math.max(0, nextTier.requiredPoints - totalPoints)
  }

  let progressPercent = 0
  if (data.progressPercent !== undefined && data.progressPercent !== null) {
    progressPercent = Number(data.progressPercent)
  } else if (data.progress_percent !== undefined && data.progress_percent !== null) {
    progressPercent = Number(data.progress_percent)
  } else if (nextTier) {
    const startThreshold = currentTier ? currentTier.requiredPoints : 0
    const endThreshold = nextTier.requiredPoints
    const delta = endThreshold - startThreshold
    if (delta > 0) {
      progressPercent = Math.min(100, Math.max(0, ((totalPoints - startThreshold) / delta) * 100))
    }
  } else if (!nextTier && currentTier) {
    // Highest tier reached
    progressPercent = 100
  }

  // Safe clamping to 0-100%
  const clampedProgress = Math.min(100, Math.max(0, Number(progressPercent.toFixed(1))))
  const isStarter = totalPoints < 10 || currentTier === null
  const isMaxTier = nextTier === null && currentTier !== null

  return {
    totalPoints,
    currentTier,
    nextTier,
    pointsToNextTier,
    progressPercent: clampedProgress,
    isStarter,
    isMaxTier,
  }
}

/**
 * Normalizes PointTransaction from backend API response
 */
export const normalizePointTransaction = (tx) => {
  if (!tx) return null
  return {
    id: tx.id,
    createdAt: tx.createdAt || tx.created_at || new Date().toISOString(),
    pointsDelta: Number(tx.pointsDelta ?? tx.points_delta ?? 0),
    reason: tx.reason || 'Verified work hours',
    workSessionId: tx.workSessionId ?? tx.work_session_id ?? null,
    bookingId: tx.bookingId ?? tx.booking_id ?? null,
    jobTitle: tx.jobTitle || tx.job_title || null,
  }
}

/**
 * Normalizes WorkSession from backend API response
 */
export const normalizeWorkSession = (ws) => {
  if (!ws) return null
  return {
    id: ws.id,
    bookingId: ws.bookingId ?? ws.booking_id,
    jobId: ws.jobId ?? ws.job_id,
    studentId: ws.studentId ?? ws.student_id,
    startedAt: ws.startedAt || ws.started_at,
    endedAt: ws.endedAt || ws.ended_at,
    verifiedMinutes: Number(ws.verifiedMinutes ?? ws.verified_minutes ?? 0),
    status: (ws.status || 'SUBMITTED').toUpperCase(),
    submittedAt: ws.submittedAt || ws.submitted_at || ws.createdAt || ws.created_at,
    verifiedAt: ws.verifiedAt || ws.verified_at,
    verifiedBy: ws.verifiedBy ?? ws.verified_by,
    notes: ws.notes || '',
    jobTitle: ws.jobTitle || ws.job_title || '',
    studentName: ws.studentName || ws.student_name || '',
  }
}

/**
 * Determine a tier's status relative to student points and current tier
 * @returns {'reached' | 'current' | 'upcoming'}
 */
export const getTierStatus = (tier, summary) => {
  if (!tier) return 'upcoming'
  if (summary?.currentTier?.tierCode === tier.tierCode) {
    return 'current'
  }
  const totalPoints = summary?.totalPoints ?? 0
  if (totalPoints >= tier.requiredPoints) {
    return 'reached'
  }
  return 'upcoming'
}
