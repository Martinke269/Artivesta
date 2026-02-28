/**
 * Intelligence Caching System
 * 
 * Cross-platform caching for CVR validations and other shared data
 * to minimize API costs across the Artissafe.dk ecosystem
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CVRData {
  cvr: string;
  companyName: string;
  address?: string;
  city?: string;
  zipCode?: string;
  isValid: boolean;
  validatedAt: string;
}

class IntelligenceCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CVR_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for CVR data

  constructor() {
    this.cache = new Map();
    
    // Load from localStorage if available (browser only)
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttl || this.DEFAULT_TTL),
    };

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  /**
   * Validate and cache CVR number
   */
  async validateCVR(cvr: string): Promise<CVRData | null> {
    // Normalize CVR (remove spaces, dashes)
    const normalizedCVR = cvr.replace(/[\s-]/g, '');
    const cacheKey = `cvr:${normalizedCVR}`;

    // Check cache first
    const cached = this.get<CVRData>(cacheKey);
    if (cached) {
      console.log(`[Intelligence Cache] CVR ${normalizedCVR} found in cache`);
      return cached;
    }

    // If not in cache, validate (mock implementation - replace with actual API)
    console.log(`[Intelligence Cache] Validating CVR ${normalizedCVR} via API`);
    
    try {
      // Mock validation - in production, call actual CVR API
      const isValid = /^\d{8}$/.test(normalizedCVR);
      
      const cvrData: CVRData = {
        cvr: normalizedCVR,
        companyName: `Company ${normalizedCVR}`, // Would come from API
        isValid,
        validatedAt: new Date().toISOString(),
      };

      // Cache the result for 7 days
      this.set(cacheKey, cvrData, this.CVR_TTL);
      
      return cvrData;
    } catch (error) {
      console.error('[Intelligence Cache] CVR validation failed:', error);
      return null;
    }
  }

  /**
   * Get CVR data from cache only (no API call)
   */
  getCVR(cvr: string): CVRData | null {
    const normalizedCVR = cvr.replace(/[\s-]/g, '');
    const cacheKey = `cvr:${normalizedCVR}`;
    return this.get<CVRData>(cacheKey);
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    });

    if (cleared > 0) {
      console.log(`[Intelligence Cache] Cleared ${cleared} expired entries`);
      this.saveToStorage();
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    this.saveToStorage();
    console.log('[Intelligence Cache] All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let cvrEntries = 0;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
        if (key.startsWith('cvr:')) {
          cvrEntries++;
        }
      }
    });

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      cvr: cvrEntries,
    };
  }

  /**
   * Save cache to localStorage (browser only)
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('intelligence_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('[Intelligence Cache] Failed to save to storage:', error);
    }
  }

  /**
   * Load cache from localStorage (browser only)
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('intelligence_cache');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData);
        
        // Clear expired entries on load
        this.clearExpired();
        
        const stats = this.getStats();
        console.log('[Intelligence Cache] Loaded from storage:', stats);
      }
    } catch (error) {
      console.error('[Intelligence Cache] Failed to load from storage:', error);
    }
  }
}

// Singleton instance
let intelligenceCache: IntelligenceCache | null = null;

export function getIntelligenceCache(): IntelligenceCache {
  if (!intelligenceCache) {
    intelligenceCache = new IntelligenceCache();
  }
  return intelligenceCache;
}

// Export types
export type { CVRData, CacheEntry };
