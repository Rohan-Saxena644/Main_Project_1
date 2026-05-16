/**
 * utils/rateLimiter.js
 *
 * Rate limiting using express-rate-limit with an optional Redis backing store.
 * Falls back to in-memory limiting when REDIS_URL is not configured
 * or when the Redis-backed store cannot be initialized cleanly.
 */

const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const Redis = require("ioredis");
const { ipKeyGenerator } = rateLimit;

let redisClient = null;

function getRateLimitRedisClient() {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });

    redisClient.on("error", (err) => {
      console.warn("Rate limit Redis error:", err.message);
    });

    return redisClient;
  } catch (err) {
    console.warn("Rate limit Redis init failed:", err.message);
    return null;
  }
}

function makeStore(prefix) {
  const client = getRateLimitRedisClient();
  if (!client) return undefined;

  try {
    return new RedisStore({
      sendCommand: (...args) => client.call(...args),
      prefix,
    });
  } catch (err) {
    console.warn("Rate limit store init failed, using memory store:", err.message);
    return undefined;
  }
}

function onLimitReached(req, res, options) {
  res.status(options.statusCode).json({
    error: options.message,
    retryAfter: Math.ceil(options.windowMs / 1000 / 60),
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many login attempts. Please try again in 15 minutes.",
  store: makeStore("rl:auth:"),
  handler: onLimitReached,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: "AI request limit reached. Please wait a moment before trying again.",
  store: makeStore("rl:ai:"),
  handler: onLimitReached,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
  store: makeStore("rl:write:"),
  handler: onLimitReached,
  keyGenerator: (req) =>
    req.user?._id ? `user:${req.user._id}` : ipKeyGenerator(req.ip),
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please slow down.",
  store: makeStore("rl:general:"),
  handler: onLimitReached,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});

module.exports = { authLimiter, aiLimiter, writeLimiter, generalLimiter };
