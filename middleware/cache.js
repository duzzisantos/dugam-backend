const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function cacheMiddleware(keyPrefix, ttl) {
  return (req, res, next) => {
    const key = keyPrefix + ":" + req.originalUrl;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, ttl || 300);
      }
      return originalJson(body);
    };

    next();
  };
}

function invalidateCache(keyPrefix) {
  const keys = cache.keys().filter((k) => k.startsWith(keyPrefix + ":"));
  cache.del(keys);
}

module.exports = { cache, cacheMiddleware, invalidateCache };
