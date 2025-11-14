/**
 * Simple in-memory rate limiting
 * Note: This resets on server restart. For production, consider using Redis or Upstash
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the interval
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit data
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  AUTH_LOGIN: { interval: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  AUTH_SIGNUP: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  AUTH_PASSWORD_RESET: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  API_VOCABULARY_AUDIO: { interval: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  API_LESSON_GENERATION: { interval: 60 * 60 * 1000, maxRequests: 10 }, // 10 requests per hour
  API_DEFAULT: { interval: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
} as const;

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success status and reset time
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;
  
  let store = rateLimitStore.get(key);
  
  // Initialize or reset if time window has passed
  if (!store || store.resetTime < now) {
    store = {
      count: 0,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, store);
  }
  
  // Check if limit exceeded
  if (store.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: store.resetTime,
    };
  }
  
  // Increment counter
  store.count++;
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - store.count,
    reset: store.resetTime,
  };
}

/**
 * Get client identifier from request headers
 * Checks x-forwarded-for (Vercel) and x-real-ip headers
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  // Use the first IP in x-forwarded-for chain
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Clear old rate limit entries to prevent memory bloat
 * Call this periodically (e.g., in a cron job)
 */
export function clearExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, store] of rateLimitStore.entries()) {
    if (store.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredRateLimits, 10 * 60 * 1000);
}
