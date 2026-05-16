
const Redis = require("ioredis");
const crypto = require("crypto");

let client = null;


const TTL = {
  detail:       60 * 10,   // 10 min  — only changes on listing edit/delete
  availability: 60 * 2,    // 2 min   — changes every time a booking is made/cancelled
  list:         60 * 5,    // 5 min   — versioned, old entries die naturally
  featured:     60 * 15,   // 15 min  — home page curated list
};


function getClient() {
  if (client) return client;

  if (!process.env.REDIS_URL) {
    return null; 
  }

  try {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    client.on("error", (err) => {
      console.warn("Redis error (cache disabled):", err.message);
      client = null; 
    });

    console.log("Redis cache connected.");
    return client;
  } catch (err) {
    console.warn("Redis init failed:", err.message);
    return null;
  }
}



function detailKey(id) {
  return `listing:detail:${id}`;
}


function availKey(id) {
  return `listing:availability:${id}`;
}

function listVersionKey() {
  return `listing:list:version`;
}

/**
 * Versioned list cache key.
 *
 * Flow:
 *   1. Read current version integer from Redis (0 if key doesn't exist yet)
 *   2. Hash the filter object to a short string
 *   3. Combine into listing:list:v{N}:{hash}
 *
 * When a listing or booking changes, we INCR the version.
 * The old keys (e.g. listing:list:v3:abc123) become unreachable
 * and expire quietly via TTL. No KEYS scan, no DEL loop needed.
 */
async function listKey(filterObj) {
  const redis = getClient();
  let version = 0;
  if (redis) {
    try {
      const raw = await redis.get(listVersionKey());
      version = raw ? parseInt(raw, 10) : 0;
    } catch {
      version = 0;
    }
  }

  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(filterObj))
    .digest("hex")
    .slice(0, 8);

  return `listing:list:v${version}:${hash}`;
}


function featuredKey() {
  return `home:featured`;
}



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

async function cacheSet(key, value, ttl = TTL.detail) {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
  }
}

async function cacheDel(...keys) {
  const redis = getClient();
  if (!redis) return;
  const flat = keys.filter(Boolean);
  if (flat.length === 0) return;
  try {
    await redis.del(...flat);
  } catch {
  }
}




async function invalidateListingDetail(id) {
  await cacheDel(detailKey(id));
}


async function invalidateListingAvailability(id) {
  await cacheDel(availKey(id));
}

/**
 * Called when any listing write or booking event should bust the list view.
 *
 * Increments the version counter. All existing list cache entries
 * (listing:list:v{old}:*) are now unreachable and will expire via TTL.
 * This replaces the old cacheDel("listings:all:*") KEYS scan.
 */
async function invalidateListingList() {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.incr(listVersionKey());
  } catch {
    // silently skip
  }
}

/**
 * Full invalidation for a listing — used after booking create/cancel.
 * Busts detail, availability, and bumps list version in parallel.
 */
async function invalidateAllForListing(listingId) {
  await Promise.all([
    invalidateListingDetail(listingId),
    invalidateListingAvailability(listingId),
    invalidateListingList(),
  ]);
}


module.exports = {

  cacheGet,
  cacheSet,
  cacheDel,
  
  TTL,

  detailKey,
  availKey,
  listKey,
  featuredKey,

  invalidateListingDetail,
  invalidateListingAvailability,
  invalidateListingList,
  invalidateAllForListing,
};
