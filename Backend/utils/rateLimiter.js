/**
 * utils/rateLimiter.js
 *
 * Rate limiting using express-rate-limit with a Redis backing store.
 * Falls back to in-memory store when REDIS_URL is not set (local dev).
 *
 * Install before using:
 *   npm install express-rate-limit rate-limit-redis
 *
 * Four tiers — applied to different route groups:
 *
 *   authLimiter       → /api/login  /api/signup
 *                       5 attempts per 15 min per IP
 *                       Strictest — brute force protection
 *
 *   aiLimiter         → /api/ai/*
 *                       20 requests per minute per IP
 *                       AI calls are expensive, keep this tight
 *
 *   writeLimiter      → POST/PUT/DELETE on /api/listings
 *                       POST /api/bookings
 *                       PATCH /api/bookings/:id/cancel
 *                       30 requests per minute per IP
 *                       Prevents bulk create/spam without blocking normal use
 *
 *   generalLimiter    → Everything else (GET /api/listings, reviews, etc.)
 *                       200 requests per minute per IP
 *                       Generous — covers normal browsing and the frontend
 *                       polling for availability
 */

const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");

// -----------------------------------------------------------------
// Redis client for the rate limiter
// Separate from the cache client so a cache error never accidentally
// disables rate limiting, and vice versa
// -----------------------------------------------------------------
let redisClient = null;

function getRateLimitRedisClient() {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      console.warn("Rate limit Redis error (falling back to memory):", err.message);
      redisClient = null;
    });

    return redisClient;
  } catch (err) {
    console.warn("Rate limit Redis init failed:", err.message);
    return null;
  }
}

// -----------------------------------------------------------------
// Store factory
// Returns a Redis-backed store when Redis is available,
// falls back to the default in-memory store when it is not.
// In-memory is fine for single-instance dev — not for multi-instance prod.
// The load balancer section in the README explains why Redis matters there.
// -----------------------------------------------------------------
function makeStore(prefix) {
  const client = getRateLimitRedisClient();
  if (!client) return undefined; // express-rate-limit uses memory store by default

  return new RedisStore({
    sendCommand: (...args) => client.call(...args),
    prefix, // e.g. "rl:auth:" — keeps rate limit keys separate from cache keys
  });
}

// -----------------------------------------------------------------
// Handler called when a client exceeds their limit
// Returns JSON instead of the default plain-text response
// -----------------------------------------------------------------
function onLimitReached(req, res, options) {
  res.status(options.statusCode).json({
    error: options.message,
    retryAfter: Math.ceil(options.windowMs / 1000 / 60), // minutes
  });
}

// -----------------------------------------------------------------
// AUTH limiter  — /api/login  /api/signup
// 5 requests per 15 minutes per IP
// -----------------------------------------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,  // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,   // Disable the old X-RateLimit-* headers
  message: "Too many login attempts. Please try again in 15 minutes.",
  store: makeStore("rl:auth:"),
  handler: onLimitReached,
  skipSuccessfulRequests: true, // only count failed attempts (401/429)
  keyGenerator: (req) => req.ip,
});

// -----------------------------------------------------------------
// AI limiter  — /api/ai/*
// 20 requests per minute per IP
// -----------------------------------------------------------------
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "AI request limit reached. Please wait a moment before trying again.",
  store: makeStore("rl:ai:"),
  handler: onLimitReached,
  keyGenerator: (req) => req.ip,
});

// -----------------------------------------------------------------
// Write limiter  — listing writes, booking create/cancel
// 30 requests per minute per user (falls back to IP for anon)
// Keying on user ID is better than IP here — a shared office IP
// shouldn't block one user because another is creating listings
// -----------------------------------------------------------------
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
  store: makeStore("rl:write:"),
  handler: onLimitReached,
  // Use authenticated user ID when available, otherwise fall back to IP
  keyGenerator: (req) => (req.user?._id ? `user:${req.user._id}` : req.ip),
});

// -----------------------------------------------------------------
// General limiter  — all read endpoints
// 200 requests per minute per IP
// -----------------------------------------------------------------
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
  store: makeStore("rl:general:"),
  handler: onLimitReached,
  keyGenerator: (req) => req.ip,
});

module.exports = { authLimiter, aiLimiter, writeLimiter, generalLimiter };