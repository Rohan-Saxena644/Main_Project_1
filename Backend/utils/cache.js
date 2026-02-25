/**
 * utils/cache.js
 *
 * Redis caching utility using ioredis.
 * Gracefully falls back to a no-op if REDIS_URL is not configured,
 * so the app works fine locally and on Render free tier without Redis.
 */

const Redis = require("ioredis");

let client = null;

const CACHE_TTL = 60 * 5; // 5 minutes in seconds

function getClient() {
    if (client) return client;

    if (!process.env.REDIS_URL) {
        return null; // Redis not configured — no-op mode
    }

    try {
        client = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 2,
            connectTimeout: 5000,
            enableOfflineQueue: false,
            lazyConnect: true,
        });

        client.on("error", (err) => {
            // Log quietly — don't crash the server
            console.warn("⚠️  Redis connection error (caching disabled):", err.message);
            client = null; // Reset so next request re-tries
        });

        console.log("✅ Redis cache connected.");
        return client;
    } catch (err) {
        console.warn("⚠️  Redis init failed:", err.message);
        return null;
    }
}

/**
 * Get a cached value by key.
 * Returns the parsed object or null if not cached / Redis unavailable.
 */
async function cacheGet(key) {
    const redis = getClient();
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Set a value in cache with an optional TTL (seconds).
 */
async function cacheSet(key, value, ttl = CACHE_TTL) {
    const redis = getClient();
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch {
        // Silently ignore — the response was already sent
    }
}

/**
 * Delete one or more keys from cache.
 * Accepts string keys or glob patterns (e.g. "listings:*").
 */
async function cacheDel(...keys) {
    const redis = getClient();
    if (!redis) return;
    try {
        const toDelete = [];
        for (const key of keys) {
            if (key.includes("*")) {
                const matched = await redis.keys(key);
                toDelete.push(...matched);
            } else {
                toDelete.push(key);
            }
        }
        if (toDelete.length > 0) await redis.del(...toDelete);
    } catch {
        // Silently ignore
    }
}

module.exports = { cacheGet, cacheSet, cacheDel };
