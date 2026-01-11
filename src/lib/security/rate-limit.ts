/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API routes
 * 
 * Note: This is a basic implementation. For production with multiple servers,
 * consider using Redis or a distributed rate limiting solution.
 */

type RateLimitRecord = {
    count: number
    resetTime: number
}

// In-memory store for rate limit records
const rateLimitStore = new Map<string, RateLimitRecord>()

/**
 * Rate limit a request
 * @param identifier - Unique identifier for the request (e.g., userId, IP address)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limit exceeded
 */
export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // Clean up expired entries periodically (every 100 checks)
    if (Math.random() < 0.01) {
        cleanupExpiredRecords()
    }

    // No existing record or expired - create new
    if (!record || record.resetTime < now) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        })
        return true
    }

    // Increment count
    record.count++

    // Check if limit exceeded
    if (record.count > limit) {
        return false
    }

    return true
}

/**
 * Get remaining requests for an identifier
 */
export function getRateLimitInfo(identifier: string, limit: number = 10): {
    remaining: number
    resetTime: number
} {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record || record.resetTime < now) {
        return {
            remaining: limit,
            resetTime: now + 60000
        }
    }

    return {
        remaining: Math.max(0, limit - record.count),
        resetTime: record.resetTime
    }
}

/**
 * Reset rate limit for an identifier (useful for testing or admin overrides)
 */
export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier)
}

/**
 * Clean up expired rate limit records
 */
function cleanupExpiredRecords(): void {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
        if (record.resetTime < now) {
            rateLimitStore.delete(key)
        }
    }
}

/**
 * Get client identifier from request (IP or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
    // Prefer user ID if authenticated
    if (userId) {
        return `user:${userId}`
    }

    // Fall back to IP address
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    return `ip:${ip}`
}
