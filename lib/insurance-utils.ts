/**
 * Insurance utility functions that can be used in both client and server components
 */

/**
 * Calculate days until insurance expires
 */
export function getInsuranceDaysRemaining(coverageEnd: string | null): number {
  if (!coverageEnd) return 0

  const endDate = new Date(coverageEnd)
  const today = new Date()
  return Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  )
}
