import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter for general API requests
 * 500 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Rate limiter for public parcel tracking lookups
 * 100 requests per 15 minutes per IP
 */
export const trackingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many tracking requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for authentication endpoints (e.g. admin login)
 * 10 attempts per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
});

export default {
  globalRateLimiter,
  trackingRateLimiter,
  authRateLimiter,
};
