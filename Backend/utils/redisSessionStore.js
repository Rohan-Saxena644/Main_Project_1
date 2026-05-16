const session = require("express-session");
const Redis = require("ioredis");

class RedisSessionStore extends session.Store {
  constructor({ redisUrl, prefix = "sess:" } = {}) {
    super();
    this.prefix = prefix;
    this.client = redisUrl
      ? new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          connectTimeout: 5000,
          enableOfflineQueue: false,
          lazyConnect: true,
        })
      : null;

    if (this.client) {
      this.client.on("error", (err) => {
        console.warn("Redis session store error:", err.message);
      });
    }
  }

  getKey(sid) {
    return `${this.prefix}${sid}`;
  }

  get(sid, callback) {
    if (!this.client) return callback(null, null);

    this.client
      .get(this.getKey(sid))
      .then((data) => callback(null, data ? JSON.parse(data) : null))
      .catch((err) => callback(err));
  }

  set(sid, sessionData, callback = () => {}) {
    if (!this.client) return callback(null);

    const ttlSeconds = this.getTtl(sessionData);

    this.client
      .set(this.getKey(sid), JSON.stringify(sessionData), "EX", ttlSeconds)
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  destroy(sid, callback = () => {}) {
    if (!this.client) return callback(null);

    this.client
      .del(this.getKey(sid))
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  touch(sid, sessionData, callback = () => {}) {
    if (!this.client) return callback(null);

    const ttlSeconds = this.getTtl(sessionData);

    this.client
      .expire(this.getKey(sid), ttlSeconds)
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  getTtl(sessionData) {
    const maxAge = sessionData?.cookie?.maxAge;
    if (!maxAge) return 24 * 60 * 60;
    return Math.max(1, Math.ceil(maxAge / 1000));
  }
}

module.exports = RedisSessionStore;
