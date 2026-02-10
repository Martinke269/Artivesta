// ============================================================================
// BUYER INSURANCE TYPES
// ============================================================================

export interface BuyerInsuranceStats {
  totalInsured: number
  expiringSoon: number // within 60 days
  expired: number
  missing: number
}

export interface BuyerInsuranceFilters {
  search?: string
  status?: string // valid, expiring_soon, expired, missing
  insuranceHolder?: string // gallery, buyer, external, missing
  galleryId?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  sortBy?: 'newest' | 'expiring_soon' | 'status'
}
